import { supabase } from "@/integrations/supabase/client";

/**
 * Represents a single dimension score
 */
export interface DimensionScore {
  name: string;
  score: number;
  weight: number;
  label: string;
}

/**
 * Represents the complete scoring result
 */
export interface ScoringResult {
  total: number;
  dimensions: DimensionScore[];
}

/**
 * Configuration for a scoring dimension
 */
export interface ScoringConfig {
  id: string;
  dimension: string;
  weight: number;
  rules: Record<string, unknown>;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Default dimension weights that sum to 100%
 */
const DEFAULT_WEIGHTS = {
  data_quality: 20,
  commercial_potential: 30,
  strategic_relevance: 25,
  circuit_status: 15,
  risk: 10,
};

/**
 * Calculate the Data Quality dimension score (0-100)
 * Measures: completeness of profile fields (email, phone, address, contacts)
 */
export function calculateDataQuality(entity: Record<string, unknown>): number {
  let score = 0;
  const fields = [
    { field: "email", weight: 25 },
    { field: "phone", weight: 25 },
    { field: "address", weight: 25 },
    { field: "mobile", weight: 25 }, // For partners, fallback for phone
  ];

  let totalWeight = 0;
  for (const { field, weight } of fields) {
    if (entity[field]) {
      score += weight;
    }
    totalWeight += weight;
  }

  // Check for partner_contacts if available (indicates contact data)
  if (entity.partner_contacts && Array.isArray(entity.partner_contacts) && entity.partner_contacts.length > 0) {
    score = Math.min(100, score + 10);
  }

  return Math.min(100, (score / totalWeight) * 100);
}

/**
 * Calculate the Commercial Potential dimension score (0-100)
 * Measures: company size, services offered, network memberships
 */
export function calculateCommercialPotential(entity: Record<string, unknown>): number {
  let score = 0;

  // Company size indicators (for prospects: dipendenti, fatturato; for partners: partner_type)
  if (entity.dipendenti && entity.dipendenti > 0) {
    const employeeScore = Math.min(40, (Math.log(entity.dipendenti) / Math.log(1000)) * 40);
    score += employeeScore;
  }

  if (entity.fatturato && entity.fatturato > 0) {
    const revenueScore = Math.min(30, (Math.log(entity.fatturato) / Math.log(10000000)) * 30);
    score += revenueScore;
  }

  // Services/Partner types
  if (entity.partner_type) {
    score += 15;
  }

  // Network memberships (WCA member, certifications)
  if (entity.wca_id) {
    score += 10;
  }

  if (entity.enrichment_data?.certifications && Array.isArray(entity.enrichment_data.certifications)) {
    if (entity.enrichment_data.certifications.length > 0) {
      score += 5;
    }
  }

  return Math.min(100, score);
}

/**
 * Calculate the Strategic Relevance dimension score (0-100)
 * Measures: geographic coverage, service alignment with user preferences
 */
export function calculateStrategicRelevance(entity: Record<string, unknown>): number {
  let score = 0;

  // Geographic coverage (has address, multiple branches, multiple countries)
  if (entity.address) {
    score += 20;
  }

  if (entity.country_code) {
    score += 15;
  }

  if (entity.has_branches) {
    score += 20;
  }

  if (entity.branch_cities && Array.isArray(entity.branch_cities) && entity.branch_cities.length > 1) {
    score += 15;
  }

  // Service alignment (services_offered, descrizione_ateco for prospects)
  if (entity.enrichment_data?.services_offered && Array.isArray(entity.enrichment_data.services_offered)) {
    score += 15;
  }

  if (entity.descrizione_ateco) {
    score += 10;
  }

  // Profile description completeness
  if (entity.profile_description && entity.profile_description.length > 100) {
    score += 5;
  }

  return Math.min(100, score);
}

/**
 * Calculate the Circuit Status dimension score (0-100)
 * Measures: lead_status progression, activity recency, response rate
 */
export function calculateCircuitStatus(entity: Record<string, unknown>): number {
  let score = 0;

  // Lead status progression
  const statusWeights: Record<string, number> = {
    converted: 40,
    hot: 35,
    warm: 25,
    cold: 10,
    interested: 30,
    contacted: 20,
  };

  if (entity.lead_status && statusWeights[entity.lead_status.toLowerCase()]) {
    score += statusWeights[entity.lead_status.toLowerCase()];
  }

  // Activity recency
  if (entity.last_interaction_at) {
    const daysSinceLastInteraction = (Date.now() - new Date(entity.last_interaction_at).getTime()) / (1000 * 60 * 60 * 24);
    if (daysSinceLastInteraction < 7) {
      score += 35;
    } else if (daysSinceLastInteraction < 30) {
      score += 25;
    } else if (daysSinceLastInteraction < 90) {
      score += 10;
    }
  }

  // Response/Interaction count
  if (entity.interaction_count && entity.interaction_count > 0) {
    const interactionScore = Math.min(25, entity.interaction_count * 5);
    score += interactionScore;
  }

  return Math.min(100, score);
}

/**
 * Calculate the Risk dimension score (0-100, lower is better for risk)
 * Measures: blacklist proximity, data staleness, low engagement
 * Returns: lower scores = higher risk, higher scores = lower risk
 */
export function calculateRisk(entity: Record<string, unknown>): number {
  let riskPoints = 0; // Accumulate risk (lower final score = more risk)

  // Blacklist proximity
  if (entity.rating_affidabilita === "critici" || entity.is_active === false) {
    riskPoints += 40;
  }

  // Data staleness
  if (entity.enriched_at || entity.updated_at) {
    const lastUpdate = new Date(entity.enriched_at || entity.updated_at);
    const daysSinceUpdate = (Date.now() - lastUpdate.getTime()) / (1000 * 60 * 60 * 24);

    if (daysSinceUpdate > 365) {
      riskPoints += 35;
    } else if (daysSinceUpdate > 180) {
      riskPoints += 20;
    } else if (daysSinceUpdate > 90) {
      riskPoints += 10;
    }
  }

  // Low engagement (no interactions)
  if (!entity.interaction_count || entity.interaction_count === 0) {
    riskPoints += 25;
  }

  // Convert risk points to score (0-100, where 100 = low risk)
  return Math.max(0, 100 - riskPoints);
}

/**
 * Calculate the composite score for an entity
 */
export function calculateScore(entity: Record<string, unknown>, entityType: "partner" | "prospect", config?: ScoringConfig[]): ScoringResult {
  // Build weights from config or use defaults
  const weights = { ...DEFAULT_WEIGHTS };

  if (config && Array.isArray(config)) {
    config.forEach((cfg) => {
      const dimensionKey = cfg.dimension.toLowerCase().replace(/-/g, "_");
      if (dimensionKey in weights) {
        weights[dimensionKey as keyof typeof weights] = cfg.weight;
      }
    });
  }

  // Calculate dimension scores
  const dataQualityScore = calculateDataQuality(entity);
  const commercialPotentialScore = calculateCommercialPotential(entity);
  const strategicRelevanceScore = calculateStrategicRelevance(entity);
  const circuitStatusScore = calculateCircuitStatus(entity);
  const riskScore = calculateRisk(entity);

  // Create dimension objects
  const dimensions: DimensionScore[] = [
    {
      name: "data_quality",
      label: "Qualità Dati",
      score: dataQualityScore,
      weight: weights.data_quality,
    },
    {
      name: "commercial_potential",
      label: "Potenziale Commerciale",
      score: commercialPotentialScore,
      weight: weights.commercial_potential,
    },
    {
      name: "strategic_relevance",
      label: "Rilevanza Strategica",
      score: strategicRelevanceScore,
      weight: weights.strategic_relevance,
    },
    {
      name: "circuit_status",
      label: "Stato Circuito",
      score: circuitStatusScore,
      weight: weights.circuit_status,
    },
    {
      name: "risk",
      label: "Rischio",
      score: riskScore,
      weight: weights.risk,
    },
  ];

  // Calculate weighted total
  const totalScore = dimensions.reduce((sum, dim) => {
    return sum + (dim.score * dim.weight) / 100;
  }, 0);

  return {
    total: Math.round(totalScore),
    dimensions,
  };
}

/**
 * Batch score all partners and update their priority_score field
 */
export async function batchScorePartners(): Promise<{ updated: number; error?: string }> {
  try {
    // Fetch all partners with relevant data
    const { data: partners, error: fetchError } = await supabase
      .from("partners")
      .select(
        `
        id,
        company_name,
        email,
        phone,
        mobile,
        address,
        country_code,
        city,
        lead_status,
        last_interaction_at,
        interaction_count,
        wca_id,
        partner_type,
        has_branches,
        branch_cities,
        enrichment_data,
        enriched_at,
        updated_at,
        is_active,
        profile_description,
        rating_details
      `
      );

    if (fetchError) throw fetchError;
    if (!partners) return { updated: 0, error: "No partners found" };

    // Fetch scoring config
    const { data: scoringConfigs } = await supabase.from("scoring_config").select("*").eq("is_active", true);

    // Calculate scores for each partner
    const updates = partners
      .map((partner) => {
        const result = calculateScore(partner, "partner", scoringConfigs || undefined);
        return {
          id: partner.id,
          priority_score: result.total,
        };
      })
      .filter((u) => u.id);

    // Update partners in batches
    let updated = 0;
    const BATCH_SIZE = 100;

    for (let i = 0; i < updates.length; i += BATCH_SIZE) {
      const batch = updates.slice(i, i + BATCH_SIZE);
      const { error: updateError } = await supabase.from("partners").upsert(batch, { onConflict: "id" });

      if (updateError) throw updateError;
      updated += batch.length;
    }

    return { updated };
  } catch (error) {
    return {
      updated: 0,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Batch score all prospects and update their priority_score field
 */
export async function batchScoreProspects(): Promise<{ updated: number; error?: string }> {
  try {
    // Fetch all prospects with relevant data
    const { data: prospects, error: fetchError } = await supabase
      .from("prospects")
      .select(
        `
        id,
        company_name,
        email,
        phone,
        address,
        country_code,
        city,
        lead_status,
        last_interaction_at,
        interaction_count,
        dipendenti,
        fatturato,
        descrizione_ateco,
        updated_at,
        profile_description,
        rating_affidabilita,
        enrichment_data
      `
      );

    if (fetchError) throw fetchError;
    if (!prospects) return { updated: 0, error: "No prospects found" };

    // Fetch scoring config
    const { data: scoringConfigs } = await supabase.from("scoring_config").select("*").eq("is_active", true);

    // Calculate scores for each prospect
    const updates = prospects
      .map((prospect) => {
        const result = calculateScore(prospect, "prospect", scoringConfigs || undefined);
        return {
          id: prospect.id,
          priority_score: result.total,
        };
      })
      .filter((u) => u.id);

    // Update prospects in batches
    let updated = 0;
    const BATCH_SIZE = 100;

    for (let i = 0; i < updates.length; i += BATCH_SIZE) {
      const batch = updates.slice(i, i + BATCH_SIZE);
      const { error: updateError } = await supabase.from("prospects").upsert(batch, { onConflict: "id" });

      if (updateError) throw updateError;
      updated += batch.length;
    }

    return { updated };
  } catch (error) {
    return {
      updated: 0,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

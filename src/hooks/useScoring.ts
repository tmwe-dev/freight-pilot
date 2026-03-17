import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { calculateScore, batchScorePartners, batchScoreProspects, type ScoringConfig, type ScoringResult } from "@/lib/scoring/scoringEngine";

/**
 * Fetch the current scoring configuration from Supabase
 */
export function useScoringConfig() {
  return useQuery({
    queryKey: ["scoring-config"],
    queryFn: async () => {
      const { data, error } = await supabase.from("scoring_config").select("*").eq("is_active", true);
      if (error) throw error;
      return (data || []) as ScoringConfig[];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Update scoring configuration (weights/rules)
 */
export function useUpdateScoringConfig() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (updates: Array<{ id: string; weight?: number; rules?: Record<string, unknown> }>) => {
      // Update each config
      for (const update of updates) {
        const { error } = await supabase
          .from("scoring_config")
          .update({
            weight: update.weight,
            rules: update.rules,
            updated_at: new Date().toISOString(),
          })
          .eq("id", update.id);

        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["scoring-config"] });
    },
  });
}

/**
 * Trigger batch scoring for all partners and prospects
 */
export function useBatchScore() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const [partnerResult, prospectResult] = await Promise.all([batchScorePartners(), batchScoreProspects()]);

      if (partnerResult.error) throw new Error(`Partners: ${partnerResult.error}`);
      if (prospectResult.error) throw new Error(`Prospects: ${prospectResult.error}`);

      return {
        partnersUpdated: partnerResult.updated,
        prospectsUpdated: prospectResult.updated,
      };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["partners"] });
      queryClient.invalidateQueries({ queryKey: ["prospects"] });
      queryClient.invalidateQueries({ queryKey: ["entity-score"] });
    },
  });
}

/**
 * Get the score for a single entity
 */
export function useEntityScore(entityType: "partner" | "prospect", entityId?: string) {
  return useQuery({
    queryKey: ["entity-score", entityType, entityId],
    queryFn: async () => {
      if (!entityId) return null;

      // Fetch the entity
      const { data: entity, error } = await supabase
        .from(entityType === "partner" ? "partners" : "prospects")
        .select("*")
        .eq("id", entityId)
        .single();

      if (error) throw error;
      if (!entity) return null;

      // Fetch scoring config
      const { data: scoringConfigs } = await supabase.from("scoring_config").select("*").eq("is_active", true);

      // Calculate score
      const result = calculateScore(entity, entityType, scoringConfigs || undefined);
      return {
        entity,
        score: result,
      };
    },
    enabled: !!entityId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

/**
 * Get all partners with their scores
 */
export function useScoredPartners() {
  return useQuery({
    queryKey: ["scored-partners"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("partners")
        .select("id, company_name, priority_score, lead_status, country_code, city, last_interaction_at, interaction_count")
        .order("priority_score", { ascending: false })
        .limit(100);

      if (error) throw error;
      return (data || []) as Array<{
        id: string;
        company_name: string;
        priority_score: number | null;
        lead_status: string;
        country_code: string;
        city: string;
        last_interaction_at: string | null;
        interaction_count: number;
      }>;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Get all prospects with their scores
 */
export function useScoredProspects() {
  return useQuery({
    queryKey: ["scored-prospects"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("prospects")
        .select("id, company_name, priority_score, lead_status, country_code, city, last_interaction_at, interaction_count")
        .order("priority_score", { ascending: false })
        .limit(100);

      if (error) throw error;
      return (data || []) as Array<{
        id: string;
        company_name: string;
        priority_score: number | null;
        lead_status: string;
        country_code: string;
        city: string;
        last_interaction_at: string | null;
        interaction_count: number;
      }>;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Get average scores across dimensions for all entities
 */
export function useAverageDimensionScores(entityType: "partner" | "prospect") {
  return useQuery({
    queryKey: ["avg-dimension-scores", entityType],
    queryFn: async () => {
      // Fetch entities with necessary data
      const { data: entities, error } = await supabase
        .from(entityType === "partner" ? "partners" : "prospects")
        .select("*")
        .limit(1000);

      if (error) throw error;
      if (!entities || entities.length === 0) {
        return [
          { name: "data_quality", label: "Qualità Dati", avg: 0 },
          { name: "commercial_potential", label: "Potenziale Commerciale", avg: 0 },
          { name: "strategic_relevance", label: "Rilevanza Strategica", avg: 0 },
          { name: "circuit_status", label: "Stato Circuito", avg: 0 },
          { name: "risk", label: "Rischio", avg: 0 },
        ];
      }

      // Fetch scoring config
      const { data: scoringConfigs } = await supabase.from("scoring_config").select("*").eq("is_active", true);

      // Calculate scores for all entities and average them
      const allScores = entities
        .map((entity) => calculateScore(entity, entityType, scoringConfigs || undefined))
        .reduce(
          (acc, result) => {
            result.dimensions.forEach((dim, idx) => {
              acc[idx].scores.push(dim.score);
            });
            return acc;
          },
          [
            { name: "data_quality", label: "Qualità Dati", scores: [] as number[] },
            { name: "commercial_potential", label: "Potenziale Commerciale", scores: [] as number[] },
            { name: "strategic_relevance", label: "Rilevanza Strategica", scores: [] as number[] },
            { name: "circuit_status", label: "Stato Circuito", scores: [] as number[] },
            { name: "risk", label: "Rischio", scores: [] as number[] },
          ]
        );

      return allScores.map((dim) => ({
        name: dim.name,
        label: dim.label,
        avg: dim.scores.length > 0 ? Math.round(dim.scores.reduce((a, b) => a + b, 0) / dim.scores.length) : 0,
      }));
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

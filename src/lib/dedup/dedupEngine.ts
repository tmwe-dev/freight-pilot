import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type Contact = {
  id: string;
  email?: string | null;
  company_name?: string | null;
  city?: string | null;
  name?: string | null;
  [key: string]: any;
};

interface DedupMatch {
  clusterId?: string;
  members: Array<{
    sourceTable: string;
    sourceId: string;
    contact: Contact;
    matchScore: number;
  }>;
  matchLevel: "exact" | "strong" | "fuzzy";
  matchKey: string;
}

/**
 * Normalize company name for matching:
 * - lowercase
 * - trim whitespace
 * - remove extra spaces
 * - remove common words (ltd, inc, spa, etc.)
 */
export function normalizeCompanyName(name: string | null | undefined): string {
  if (!name) return "";

  return name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ")
    .replace(/\b(ltd|limited|inc|incorporated|spa|srl|gmbh|ag|sa|as|oy|ab)\b\.?/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Levenshtein distance algorithm for fuzzy matching
 * Returns a value between 0 and 1 (similarity ratio)
 */
export function levenshteinDistance(s1: string, s2: string): number {
  if (s1.length === 0) return s2.length > 0 ? 0 : 1;
  if (s2.length === 0) return s1.length > 0 ? 0 : 1;

  const maxLen = Math.max(s1.length, s2.length);
  const m = s1.length;
  const n = s2.length;
  const dp: number[][] = Array(m + 1)
    .fill(null)
    .map(() => Array(n + 1).fill(0));

  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = s1[i - 1] === s2[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1, // deletion
        dp[i][j - 1] + 1, // insertion
        dp[i - 1][j - 1] + cost // substitution
      );
    }
  }

  const distance = dp[m][n];
  const similarity = 1 - distance / maxLen;
  return Math.max(0, Math.min(1, similarity));
}

/**
 * Find exact email matches across all three tables
 */
export async function findExactMatches(): Promise<DedupMatch[]> {
  const matches: DedupMatch[] = [];
  const seenEmails = new Set<string>();

  // Fetch all contacts from all three sources
  const [partnerRes, importedRes, prospectRes] = await Promise.all([
    supabase.from("partners").select("id, email, company_name, city"),
    supabase.from("imported_contacts").select("id, email, company_name, city"),
    supabase.from("prospects").select("id, email, company_name, city"),
  ]);

  const partners = partnerRes.data ?? [];
  const imported = importedRes.data ?? [];
  const prospects = prospectRes.data ?? [];

  // Group by email
  const emailMap = new Map<
    string,
    Array<{ sourceTable: string; contact: Contact }>
  >();

  partners.forEach((p) => {
    if (p.email?.trim()) {
      const key = p.email.toLowerCase().trim();
      if (!emailMap.has(key)) emailMap.set(key, []);
      emailMap.get(key)!.push({ sourceTable: "partners", contact: p });
    }
  });

  imported.forEach((i) => {
    if (i.email?.trim()) {
      const key = i.email.toLowerCase().trim();
      if (!emailMap.has(key)) emailMap.set(key, []);
      emailMap.get(key)!.push({ sourceTable: "imported_contacts", contact: i });
    }
  });

  prospects.forEach((p) => {
    if (p.email?.trim()) {
      const key = p.email.toLowerCase().trim();
      if (!emailMap.has(key)) emailMap.set(key, []);
      emailMap.get(key)!.push({ sourceTable: "prospects", contact: p });
    }
  });

  // Create matches for duplicates
  emailMap.forEach((items, email) => {
    if (items.length > 1) {
      const matchKey = email;
      if (!seenEmails.has(matchKey)) {
        seenEmails.add(matchKey);
        matches.push({
          members: items.map((item) => ({
            sourceTable: item.sourceTable,
            sourceId: item.contact.id,
            contact: item.contact,
            matchScore: 1.0,
          })),
          matchLevel: "exact",
          matchKey,
        });
      }
    }
  });

  return matches;
}

/**
 * Find strong matches: normalized company_name + city match
 */
export async function findStrongMatches(): Promise<DedupMatch[]> {
  const matches: DedupMatch[] = [];
  const seenKeys = new Set<string>();

  // Fetch all contacts
  const [partnerRes, importedRes, prospectRes] = await Promise.all([
    supabase.from("partners").select("id, email, company_name, city"),
    supabase.from("imported_contacts").select("id, email, company_name, city"),
    supabase.from("prospects").select("id, email, company_name, city"),
  ]);

  const partners = partnerRes.data ?? [];
  const imported = importedRes.data ?? [];
  const prospects = prospectRes.data ?? [];

  // Group by normalized company_name + city
  const companyMap = new Map<
    string,
    Array<{ sourceTable: string; contact: Contact }>
  >();

  const processContacts = (contacts: Contact[], sourceTable: string) => {
    contacts.forEach((c) => {
      if (c.company_name?.trim() && c.city?.trim()) {
        const normalized = normalizeCompanyName(c.company_name);
        const city = c.city.toLowerCase().trim();
        const key = `${normalized}|${city}`;

        if (key.length > 2) {
          // Only if meaningful
          if (!companyMap.has(key)) companyMap.set(key, []);
          companyMap.get(key)!.push({ sourceTable, contact: c });
        }
      }
    });
  };

  processContacts(partners, "partners");
  processContacts(imported, "imported_contacts");
  processContacts(prospects, "prospects");

  // Create matches for duplicates
  companyMap.forEach((items, key) => {
    if (items.length > 1) {
      const [company] = key.split("|");
      if (!seenKeys.has(key)) {
        seenKeys.add(key);
        matches.push({
          members: items.map((item) => ({
            sourceTable: item.sourceTable,
            sourceId: item.contact.id,
            contact: item.contact,
            matchScore: 0.9,
          })),
          matchLevel: "strong",
          matchKey: key,
        });
      }
    }
  });

  return matches;
}

/**
 * Find fuzzy matches using Levenshtein distance on company names
 * Threshold: 0.85 similarity
 */
export async function findFuzzyMatches(): Promise<DedupMatch[]> {
  const matches: DedupMatch[] = [];
  const seenPairs = new Set<string>();
  const THRESHOLD = 0.85;

  // Fetch all contacts
  const [partnerRes, importedRes, prospectRes] = await Promise.all([
    supabase.from("partners").select("id, email, company_name, city"),
    supabase.from("imported_contacts").select("id, email, company_name, city"),
    supabase.from("prospects").select("id, email, company_name, city"),
  ]);

  const partners = partnerRes.data ?? [];
  const imported = importedRes.data ?? [];
  const prospects = prospectRes.data ?? [];

  const allContacts = [
    ...partners.map((c) => ({ ...c, sourceTable: "partners" })),
    ...imported.map((c) => ({ ...c, sourceTable: "imported_contacts" })),
    ...prospects.map((c) => ({ ...c, sourceTable: "prospects" })),
  ].filter((c) => c.company_name?.trim());

  // Compare all pairs
  for (let i = 0; i < allContacts.length; i++) {
    for (let j = i + 1; j < allContacts.length; j++) {
      const c1 = allContacts[i];
      const c2 = allContacts[j];

      const n1 = normalizeCompanyName(c1.company_name);
      const n2 = normalizeCompanyName(c2.company_name);

      if (!n1 || !n2) continue;

      const similarity = levenshteinDistance(n1, n2);

      if (similarity >= THRESHOLD) {
        const pairKey = [c1.id, c2.id].sort().join("|");
        if (!seenPairs.has(pairKey)) {
          seenPairs.add(pairKey);
          matches.push({
            members: [
              {
                sourceTable: c1.sourceTable,
                sourceId: c1.id,
                contact: c1,
                matchScore: similarity,
              },
              {
                sourceTable: c2.sourceTable,
                sourceId: c2.id,
                contact: c2,
                matchScore: similarity,
              },
            ],
            matchLevel: "fuzzy",
            matchKey: `${n1} <-> ${n2}`,
          });
        }
      }
    }
  }

  return matches;
}

/**
 * Run complete deduplication scan:
 * 1. Find exact matches (email)
 * 2. Find strong matches (normalized company + city)
 * 3. Find fuzzy matches (Levenshtein distance)
 * 4. Create or update clusters in database
 */
export async function runDeduplication() {
  try {
    const exactMatches = await findExactMatches();
    const strongMatches = await findStrongMatches();
    const fuzzyMatches = await findFuzzyMatches();

    const allMatches = [...exactMatches, ...strongMatches, ...fuzzyMatches];

    // Create clusters in database
    for (const match of allMatches) {
      // Insert cluster
      const { data: cluster, error: clusterError } = await supabase
        .from("dedup_clusters")
        .insert({
          match_level: match.matchLevel,
          match_key: match.matchKey,
          source_tables: match.members.map((m) => m.sourceTable),
          status: "pending",
        })
        .select("id")
        .single();

      if (clusterError) {
        console.error("Error creating cluster:", clusterError);
        continue;
      }

      // Insert cluster members
      const membersToInsert = match.members.map((member) => ({
        cluster_id: cluster.id,
        source_table: member.sourceTable,
        source_id: member.sourceId,
        match_score: member.matchScore,
        field_snapshot: {
          email: member.contact.email,
          company_name: member.contact.company_name,
          city: member.contact.city,
          name: member.contact.name,
        },
      }));

      const { error: membersError } = await supabase
        .from("dedup_cluster_members")
        .insert(membersToInsert);

      if (membersError) {
        console.error("Error creating cluster members:", membersError);
      }
    }

    return {
      success: true,
      clustersCreated: allMatches.length,
      exactMatches: exactMatches.length,
      strongMatches: strongMatches.length,
      fuzzyMatches: fuzzyMatches.length,
    };
  } catch (error) {
    console.error("Deduplication error:", error);
    throw error;
  }
}

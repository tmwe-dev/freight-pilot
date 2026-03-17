import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { runDeduplication } from "@/lib/dedup/dedupEngine";

export interface DedupCluster {
  id: string;
  match_level: "exact" | "strong" | "fuzzy";
  match_key: string;
  source_tables: string[];
  status: "pending" | "resolved" | "ignored";
  resolved_at: string | null;
  resolved_by: string | null;
  created_at: string;
  members?: DedupClusterMember[];
}

export interface DedupClusterMember {
  id: string;
  cluster_id: string;
  source_table: string;
  source_id: string;
  match_score: number | null;
  field_snapshot: any;
  is_master: boolean;
  created_at: string;
}

const DEDUP_CLUSTERS_KEY = ["dedup-clusters"] as const;
const DEDUP_STATS_KEY = ["dedup-stats"] as const;

/**
 * Fetch all dedup clusters with their members
 */
export function useDedupClusters() {
  return useQuery({
    queryKey: DEDUP_CLUSTERS_KEY,
    queryFn: async () => {
      // Fetch clusters
      const { data: clusters, error: clustersError } = await supabase
        .from("dedup_clusters")
        .select("*")
        .order("created_at", { ascending: false });

      if (clustersError) throw clustersError;

      // Fetch members for each cluster
      const clustersWithMembers: DedupCluster[] = [];
      for (const cluster of clusters ?? []) {
        const { data: members, error: membersError } = await supabase
          .from("dedup_cluster_members")
          .select("*")
          .eq("cluster_id", cluster.id)
          .order("is_master", { ascending: false });

        if (membersError) {
          console.error("Error fetching members:", membersError);
          clustersWithMembers.push(cluster as DedupCluster);
        } else {
          clustersWithMembers.push({
            ...(cluster as DedupCluster),
            members: (members ?? []) as DedupClusterMember[],
          });
        }
      }

      return clustersWithMembers;
    },
    staleTime: 30_000,
  });
}

/**
 * Fetch dedup statistics
 */
export function useDedupStats() {
  return useQuery({
    queryKey: DEDUP_STATS_KEY,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("dedup_clusters")
        .select("status", { count: "exact" });

      if (error) throw error;

      const stats = {
        total: 0,
        pending: 0,
        resolved: 0,
        ignored: 0,
        totalDuplicates: 0,
      };

      (data ?? []).forEach((cluster: any) => {
        stats.total++;
        if (cluster.status === "pending") stats.pending++;
        else if (cluster.status === "resolved") stats.resolved++;
        else if (cluster.status === "ignored") stats.ignored++;
      });

      // Count total duplicates (members - 1 per cluster)
      const { data: memberCounts } = await supabase.rpc(
        "get_dedup_cluster_member_counts" as any
      );
      if (memberCounts) {
        stats.totalDuplicates = (memberCounts ?? []).reduce(
          (sum: number, item: any) => sum + Math.max(0, item.count - 1),
          0
        );
      }

      return stats;
    },
    staleTime: 30_000,
  });
}

/**
 * Mutation: Run deduplication scan
 */
export function useRunDedup() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      return await runDeduplication();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: DEDUP_CLUSTERS_KEY });
      qc.invalidateQueries({ queryKey: DEDUP_STATS_KEY });
    },
  });
}

/**
 * Mutation: Resolve a cluster (merge/ignore)
 */
export function useResolveCluster() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      clusterId,
      action,
      masterId,
    }: {
      clusterId: string;
      action: "merge" | "ignore" | "pending";
      masterId?: string;
    }) => {
      const updates: any = {
        status: action === "merge" || action === "ignore" ? "resolved" : "pending",
        resolved_at: action !== "pending" ? new Date().toISOString() : null,
      };

      const { error } = await supabase
        .from("dedup_clusters")
        .update(updates)
        .eq("id", clusterId);

      if (error) throw error;

      // If merging, mark the master record
      if (action === "merge" && masterId) {
        const { error: masterError } = await supabase
          .from("dedup_cluster_members")
          .update({ is_master: true })
          .eq("source_id", masterId)
          .eq("cluster_id", clusterId);

        if (masterError) throw masterError;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: DEDUP_CLUSTERS_KEY });
      qc.invalidateQueries({ queryKey: DEDUP_STATS_KEY });
    },
  });
}

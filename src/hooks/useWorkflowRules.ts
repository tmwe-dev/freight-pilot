import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

export type WorkflowRule = Database["public"]["Tables"]["workflow_rules"]["Row"];
export type WorkflowExecutionLog = Database["public"]["Tables"]["workflow_execution_log"]["Row"];

/**
 * Fetch all workflow rules
 */
export function useWorkflowRules() {
  return useQuery({
    queryKey: ["workflow-rules"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("workflow_rules")
        .select("*")
        .order("priority", { ascending: true });
      if (error) throw error;
      return data as WorkflowRule[];
    },
  });
}

/**
 * Fetch workflow rules with filtering
 */
export function useWorkflowRulesFiltered(filters?: { is_active?: boolean; trigger_event?: string }) {
  return useQuery({
    queryKey: ["workflow-rules-filtered", filters],
    queryFn: async () => {
      let query = supabase.from("workflow_rules").select("*");

      if (filters?.is_active !== undefined) {
        query = query.eq("is_active", filters.is_active);
      }

      if (filters?.trigger_event) {
        query = query.eq("trigger_event", filters.trigger_event);
      }

      const { data, error } = await query.order("priority", { ascending: true });
      if (error) throw error;
      return data as WorkflowRule[];
    },
  });
}

/**
 * Create a new workflow rule
 */
export function useCreateRule() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (rule: {
      name: string;
      description?: string | null;
      trigger_event: string;
      conditions?: any;
      actions?: any;
      is_active?: boolean;
      priority?: number;
      cooldown_minutes?: number | null;
      max_executions?: number | null;
    }) => {
      const { data, error } = await supabase
        .from("workflow_rules")
        .insert([
          {
            name: rule.name,
            description: rule.description || null,
            trigger_event: rule.trigger_event,
            conditions: rule.conditions || [],
            actions: rule.actions || [],
            is_active: rule.is_active ?? true,
            priority: rule.priority ?? 10,
            cooldown_minutes: rule.cooldown_minutes || null,
            max_executions: rule.max_executions || null,
          },
        ])
        .select()
        .single();

      if (error) throw error;
      return data as WorkflowRule;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workflow-rules"] });
      queryClient.invalidateQueries({ queryKey: ["workflow-rules-filtered"] });
    },
  });
}

/**
 * Update an existing workflow rule
 */
export function useUpdateRule() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      ...updates
    }: {
      id: string;
      name?: string;
      description?: string | null;
      trigger_event?: string;
      conditions?: any;
      actions?: any;
      is_active?: boolean;
      priority?: number;
      cooldown_minutes?: number | null;
      max_executions?: number | null;
    }) => {
      const { data, error } = await supabase
        .from("workflow_rules")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data as WorkflowRule;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workflow-rules"] });
      queryClient.invalidateQueries({ queryKey: ["workflow-rules-filtered"] });
    },
  });
}

/**
 * Toggle rule active status (convenience mutation)
 */
export function useToggleRule() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { data, error } = await supabase
        .from("workflow_rules")
        .update({ is_active })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data as WorkflowRule;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workflow-rules"] });
      queryClient.invalidateQueries({ queryKey: ["workflow-rules-filtered"] });
    },
  });
}

/**
 * Delete a workflow rule
 */
export function useDeleteRule() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("workflow_rules").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workflow-rules"] });
      queryClient.invalidateQueries({ queryKey: ["workflow-rules-filtered"] });
    },
  });
}

/**
 * Fetch workflow execution log with pagination
 */
export function useWorkflowLog(limit = 50, offset = 0) {
  return useQuery({
    queryKey: ["workflow-execution-log", limit, offset],
    queryFn: async () => {
      const { data, error, count } = await supabase
        .from("workflow_execution_log")
        .select("*", { count: "exact" })
        .order("executed_at", { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;
      return {
        logs: data as WorkflowExecutionLog[],
        total: count || 0,
      };
    },
  });
}

/**
 * Fetch workflow execution log for a specific rule
 */
export function useWorkflowLogForRule(ruleId: string | null, limit = 20) {
  return useQuery({
    queryKey: ["workflow-execution-log-rule", ruleId, limit],
    queryFn: async () => {
      if (!ruleId) return { logs: [], total: 0 };

      const { data, error, count } = await supabase
        .from("workflow_execution_log")
        .select("*", { count: "exact" })
        .eq("rule_id", ruleId)
        .order("executed_at", { ascending: false })
        .limit(limit);

      if (error) throw error;
      return {
        logs: data as WorkflowExecutionLog[],
        total: count || 0,
      };
    },
    enabled: !!ruleId,
  });
}

/**
 * Get execution statistics
 */
export function useWorkflowStats() {
  return useQuery({
    queryKey: ["workflow-stats"],
    queryFn: async () => {
      // Count active rules
      const { count: activeCount, error: activeError } = await supabase
        .from("workflow_rules")
        .select("*", { count: "exact" })
        .eq("is_active", true);

      if (activeError) throw activeError;

      // Count executions today
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const { count: todayCount, error: todayError } = await supabase
        .from("workflow_execution_log")
        .select("*", { count: "exact" })
        .gte("executed_at", today.toISOString())
        .eq("result", "success");

      if (todayError) throw todayError;

      // Count executions this week
      const weekAgo = new Date(today);
      weekAgo.setDate(weekAgo.getDate() - 7);

      const { count: weekCount, error: weekError } = await supabase
        .from("workflow_execution_log")
        .select("*", { count: "exact" })
        .gte("executed_at", weekAgo.toISOString())
        .eq("result", "success");

      if (weekError) throw weekError;

      return {
        activeRules: activeCount || 0,
        executionsToday: todayCount || 0,
        executionsThisWeek: weekCount || 0,
      };
    },
    refetchInterval: 30_000, // Refresh every 30 seconds
  });
}

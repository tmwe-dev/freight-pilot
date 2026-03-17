import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

export type WorkflowRule = Database["public"]["Tables"]["workflow_rules"]["Row"];
export type WorkflowExecutionLog = Database["public"]["Tables"]["workflow_execution_log"]["Row"];
export type WorkflowCooldown = Database["public"]["Tables"]["workflow_cooldowns"]["Row"];

export interface RuleCondition {
  field: string;
  operator: "equals" | "contains" | "greater_than" | "less_than" | "in_range" | "days_since";
  value: any;
}

export interface RuleAction {
  action_type: "update_field" | "create_activity" | "change_status" | "send_notification";
  parameters: Record<string, any>;
}

/**
 * Main workflow evaluation function
 * Checks all active rules against an event and executes matching actions
 */
export async function evaluateRules(
  event: string,
  targetTable: string,
  targetId: string,
  targetData: Record<string, any>
): Promise<{ executedRules: string[]; errors: string[] }> {
  const executedRules: string[] = [];
  const errors: string[] = [];

  try {
    // Fetch all active rules that match this event
    const { data: rules, error: rulesError } = await supabase
      .from("workflow_rules")
      .select("*")
      .eq("trigger_event", event)
      .eq("is_active", true)
      .order("priority", { ascending: true });

    if (rulesError) {
      throw new Error(`Failed to fetch rules: ${rulesError.message}`);
    }

    if (!rules || rules.length === 0) {
      return { executedRules, errors };
    }

    // Evaluate each rule
    for (const rule of rules) {
      try {
        // Check cooldown
        const canExecute = await checkCooldown(rule.id, targetId);
        if (!canExecute) {
          continue;
        }

        // Parse conditions and actions from JSON
        const conditions = (rule.conditions as any) || [];
        const actions = (rule.actions as any) || [];

        // Check if conditions pass
        if (!checkConditions(conditions, targetData)) {
          continue;
        }

        // Execute actions
        const executedActions = await executeActions(actions, targetTable, targetId);

        // Log execution
        await logExecution(rule.id, targetTable, targetId, executedActions, "success");

        // Update cooldown
        await updateCooldown(rule.id, targetId, rule.max_executions || null);

        executedRules.push(rule.id);
      } catch (ruleError) {
        const errorMsg = ruleError instanceof Error ? ruleError.message : String(ruleError);
        errors.push(`Rule ${rule.id} failed: ${errorMsg}`);
        await logExecution(rule.id, targetTable, targetId, [], "error", errorMsg);
      }
    }
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    errors.push(`Workflow evaluation failed: ${errorMsg}`);
  }

  return { executedRules, errors };
}

/**
 * Evaluate conditions against target data
 * Returns true if all conditions pass
 */
export function checkConditions(conditions: any[], data: Record<string, any>): boolean {
  if (!conditions || conditions.length === 0) {
    return true;
  }

  return conditions.every((condition: RuleCondition) => {
    const value = data[condition.field];

    switch (condition.operator) {
      case "equals":
        return value === condition.value;
      case "contains":
        return String(value).includes(String(condition.value));
      case "greater_than":
        return Number(value) > Number(condition.value);
      case "less_than":
        return Number(value) < Number(condition.value);
      case "in_range":
        return (
          Number(value) >= Number(condition.value.min) &&
          Number(value) <= Number(condition.value.max)
        );
      case "days_since":
        if (!value) return false;
        const date = new Date(value);
        const now = new Date();
        const daysPassed = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
        return daysPassed >= Number(condition.value);
      default:
        return false;
    }
  });
}

/**
 * Execute workflow actions
 * Returns array of executed action summaries
 */
export async function executeActions(
  actions: any[],
  targetTable: string,
  targetId: string
): Promise<string[]> {
  const executed: string[] = [];

  if (!actions || actions.length === 0) {
    return executed;
  }

  for (const action of actions) {
    const actionType = action.action_type;
    const params = action.parameters || {};

    try {
      switch (actionType) {
        case "update_field": {
          const { field, value } = params;
          if (!field) throw new Error("update_field action requires 'field' parameter");

          const { error } = await supabase
            .from(targetTable)
            .update({ [field]: value })
            .eq("id", targetId);

          if (error) throw error;
          executed.push(`updated ${field} to ${value}`);
          break;
        }

        case "create_activity": {
          const { title, description, activity_type, priority, assigned_to } = params;
          if (!title) throw new Error("create_activity action requires 'title' parameter");

          const { error } = await supabase.from("activities").insert({
            title,
            description: description || null,
            activity_type: activity_type || "follow_up",
            priority: priority || "medium",
            assigned_to: assigned_to || null,
            source_type: targetTable as any,
            source_id: targetId,
            status: "pending",
          });

          if (error) throw error;
          executed.push(`created activity: ${title}`);
          break;
        }

        case "change_status": {
          const { status } = params;
          if (!status) throw new Error("change_status action requires 'status' parameter");

          const { error } = await supabase
            .from(targetTable)
            .update({ status })
            .eq("id", targetId);

          if (error) throw error;
          executed.push(`changed status to ${status}`);
          break;
        }

        case "send_notification": {
          const { title, message } = params;
          // Note: This is a placeholder - actual notification logic would depend on your notification service
          executed.push(`notification: ${title || "Update"} - ${message || ""}`);
          break;
        }

        default:
          throw new Error(`Unknown action type: ${actionType}`);
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      throw new Error(`${actionType} action failed: ${errorMsg}`);
    }
  }

  return executed;
}

/**
 * Check if a rule can be executed based on cooldown and max_executions
 */
export async function checkCooldown(ruleId: string, targetId: string): Promise<boolean> {
  try {
    const { data: rule, error: ruleError } = await supabase
      .from("workflow_rules")
      .select("cooldown_minutes, max_executions")
      .eq("id", ruleId)
      .single();

    if (ruleError || !rule) {
      return false;
    }

    // Check if cooldown exists
    const { data: cooldown, error: cooldownError } = await supabase
      .from("workflow_cooldowns")
      .select("*")
      .eq("rule_id", ruleId)
      .eq("target_id", targetId)
      .maybeSingle();

    if (cooldownError) {
      return true; // Allow execution if we can't check cooldown
    }

    // No previous execution
    if (!cooldown) {
      return true;
    }

    // Check cooldown period
    if (rule.cooldown_minutes) {
      const lastExecuted = new Date(cooldown.last_executed_at);
      const now = new Date();
      const minutesPassed = (now.getTime() - lastExecuted.getTime()) / (1000 * 60);
      if (minutesPassed < rule.cooldown_minutes) {
        return false;
      }
    }

    // Check max executions
    if (rule.max_executions && cooldown.execution_count >= rule.max_executions) {
      return false;
    }

    return true;
  } catch (error) {
    // Allow execution if cooldown check fails
    return true;
  }
}

/**
 * Update cooldown record for a rule/target pair
 */
async function updateCooldown(
  ruleId: string,
  targetId: string,
  maxExecutions: number | null
): Promise<void> {
  // Check if cooldown record exists
  const { data: existing, error: selectError } = await supabase
    .from("workflow_cooldowns")
    .select("*")
    .eq("rule_id", ruleId)
    .eq("target_id", targetId)
    .maybeSingle();

  if (selectError) {
    console.error("Error checking cooldown:", selectError);
    return;
  }

  if (existing) {
    // Update existing cooldown
    const newCount = existing.execution_count + 1;

    // Check if we should stop executing after max
    if (maxExecutions && newCount >= maxExecutions) {
      // Disable the rule or mark it as exhausted
      const { error: updateError } = await supabase
        .from("workflow_cooldowns")
        .update({
          last_executed_at: new Date().toISOString(),
          execution_count: newCount,
        })
        .eq("id", existing.id);

      if (updateError) {
        console.error("Error updating cooldown:", updateError);
      }
    } else {
      const { error: updateError } = await supabase
        .from("workflow_cooldowns")
        .update({
          last_executed_at: new Date().toISOString(),
          execution_count: newCount,
        })
        .eq("id", existing.id);

      if (updateError) {
        console.error("Error updating cooldown:", updateError);
      }
    }
  } else {
    // Create new cooldown record
    const { error: insertError } = await supabase.from("workflow_cooldowns").insert({
      rule_id: ruleId,
      target_id: targetId,
      last_executed_at: new Date().toISOString(),
      execution_count: 1,
    });

    if (insertError) {
      console.error("Error creating cooldown:", insertError);
    }
  }
}

/**
 * Log workflow execution to execution_log table
 */
async function logExecution(
  ruleId: string,
  targetTable: string,
  targetId: string,
  actionsExecuted: string[],
  result: "success" | "error",
  errorMessage?: string
): Promise<void> {
  const { error } = await supabase.from("workflow_execution_log").insert({
    rule_id: ruleId,
    target_table: targetTable,
    target_id: targetId,
    actions_executed: actionsExecuted,
    result,
    error_message: errorMessage || null,
    executed_at: new Date().toISOString(),
  });

  if (error) {
    console.error("Error logging workflow execution:", error);
  }
}

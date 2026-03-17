import { useState } from "react";
import { Loader2, Plus, Trash2, Edit2, ToggleLeft, ToggleRight, Zap } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  useWorkflowRules,
  useCreateRule,
  useUpdateRule,
  useDeleteRule,
  useToggleRule,
  useWorkflowLog,
  useWorkflowStats,
  type WorkflowRule,
} from "@/hooks/useWorkflowRules";
import { useToast } from "@/hooks/use-toast";

const TRIGGER_EVENT_OPTIONS = [
  { value: "lead_status_changed", label: "Lead Status Changed" },
  { value: "activity_completed", label: "Activity Completed" },
  { value: "time_elapsed", label: "Time Elapsed" },
  { value: "import_completed", label: "Import Completed" },
  { value: "score_changed", label: "Score Changed" },
];

const ACTION_TYPE_OPTIONS = [
  { value: "update_field", label: "Aggiorna Campo" },
  { value: "create_activity", label: "Crea Attività" },
  { value: "change_status", label: "Cambia Stato" },
  { value: "send_notification", label: "Invia Notifica" },
];

const OPERATOR_OPTIONS = [
  { value: "equals", label: "È uguale a" },
  { value: "contains", label: "Contiene" },
  { value: "greater_than", label: "Maggiore di" },
  { value: "less_than", label: "Minore di" },
  { value: "in_range", label: "Nell'intervallo" },
  { value: "days_since", label: "Giorni da" },
];

interface FormState {
  id?: string;
  name: string;
  description: string;
  trigger_event: string;
  conditions: Array<{ field: string; operator: string; value: any }>;
  actions: Array<{ action_type: string; parameters: Record<string, any> }>;
  priority: number;
  cooldown_minutes: number | null;
  max_executions: number | null;
}

const initialFormState: FormState = {
  name: "",
  description: "",
  trigger_event: "lead_status_changed",
  conditions: [],
  actions: [],
  priority: 10,
  cooldown_minutes: null,
  max_executions: null,
};

export default function WorkflowEngine() {
  const [open, setOpen] = useState(false);
  const [formState, setFormState] = useState<FormState>(initialFormState);
  const [page, setPage] = useState(0);

  const { data: rules, isLoading: rulesLoading } = useWorkflowRules();
  const { data: stats, isLoading: statsLoading } = useWorkflowStats();
  const { data: logData, isLoading: logLoading } = useWorkflowLog(50, page * 50);

  const createRule = useCreateRule();
  const updateRule = useUpdateRule();
  const deleteRule = useDeleteRule();
  const toggleRule = useToggleRule();
  const { toast } = useToast();

  const handleCreateNew = () => {
    setFormState(initialFormState);
    setOpen(true);
  };

  const handleEdit = (rule: WorkflowRule) => {
    setFormState({
      id: rule.id,
      name: rule.name,
      description: rule.description || "",
      trigger_event: rule.trigger_event,
      conditions: (rule.conditions as any) || [],
      actions: (rule.actions as any) || [],
      priority: rule.priority,
      cooldown_minutes: rule.cooldown_minutes,
      max_executions: rule.max_executions,
    });
    setOpen(true);
  };

  const handleSave = async () => {
    try {
      if (!formState.name.trim()) {
        toast({ description: "Nome regola richiesto", variant: "destructive" });
        return;
      }

      if (formState.id) {
        await updateRule.mutateAsync({
          id: formState.id,
          name: formState.name,
          description: formState.description,
          trigger_event: formState.trigger_event,
          conditions: formState.conditions,
          actions: formState.actions,
          priority: formState.priority,
          cooldown_minutes: formState.cooldown_minutes,
          max_executions: formState.max_executions,
        });
        toast({ description: "Regola aggiornata" });
      } else {
        await createRule.mutateAsync({
          name: formState.name,
          description: formState.description,
          trigger_event: formState.trigger_event,
          conditions: formState.conditions,
          actions: formState.actions,
          priority: formState.priority,
          cooldown_minutes: formState.cooldown_minutes,
          max_executions: formState.max_executions,
        });
        toast({ description: "Regola creata" });
      }
      setOpen(false);
      setFormState(initialFormState);
    } catch (error) {
      toast({
        description: error instanceof Error ? error.message : "Errore",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Sei sicuro di voler eliminare questa regola?")) return;
    try {
      await deleteRule.mutateAsync(id);
      toast({ description: "Regola eliminata" });
    } catch (error) {
      toast({
        description: error instanceof Error ? error.message : "Errore",
        variant: "destructive",
      });
    }
  };

  const handleToggle = async (rule: WorkflowRule) => {
    try {
      await toggleRule.mutateAsync({
        id: rule.id,
        is_active: !rule.is_active,
      });
      toast({
        description: rule.is_active ? "Regola disattivata" : "Regola attivata",
      });
    } catch (error) {
      toast({
        description: error instanceof Error ? error.message : "Errore",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Zap className="w-8 h-8 text-yellow-500" />
            Workflow Engine
          </h1>
          <p className="text-muted-foreground mt-1">
            Automazione basata su regole per il circuito di attesa
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleCreateNew} size="lg" className="gap-2">
              <Plus className="w-4 h-4" />
              Nuova Regola
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{formState.id ? "Modifica Regola" : "Nuova Regola"}</DialogTitle>
              <DialogDescription>
                Crea regole per automatizzare le azioni nel tuo workflow
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              {/* Basic Info */}
              <div>
                <Label htmlFor="rule-name">Nome Regola</Label>
                <Input
                  id="rule-name"
                  value={formState.name}
                  onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                  placeholder="Es. Auto-upgrade lead hot"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="rule-description">Descrizione</Label>
                <Input
                  id="rule-description"
                  value={formState.description}
                  onChange={(e) => setFormState({ ...formState, description: e.target.value })}
                  placeholder="Descrizione della regola"
                  className="mt-1"
                />
              </div>

              {/* Trigger Event */}
              <div>
                <Label htmlFor="trigger-event">Evento di Trigger</Label>
                <select
                  id="trigger-event"
                  value={formState.trigger_event}
                  onChange={(e) => setFormState({ ...formState, trigger_event: e.target.value })}
                  className="w-full mt-1 rounded-md border border-input bg-background px-3 py-2"
                >
                  {TRIGGER_EVENT_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Conditions */}
              <div>
                <Label>Condizioni</Label>
                <div className="space-y-2 mt-2">
                  {formState.conditions.map((cond, idx) => (
                    <div key={idx} className="flex gap-2 items-end">
                      <Input
                        placeholder="Campo"
                        value={cond.field}
                        onChange={(e) => {
                          const newConds = [...formState.conditions];
                          newConds[idx].field = e.target.value;
                          setFormState({ ...formState, conditions: newConds });
                        }}
                        className="flex-1"
                      />
                      <select
                        value={cond.operator}
                        onChange={(e) => {
                          const newConds = [...formState.conditions];
                          newConds[idx].operator = e.target.value;
                          setFormState({ ...formState, conditions: newConds });
                        }}
                        className="rounded-md border border-input bg-background px-3 py-2"
                      >
                        {OPERATOR_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                      <Input
                        placeholder="Valore"
                        value={String(cond.value)}
                        onChange={(e) => {
                          const newConds = [...formState.conditions];
                          newConds[idx].value = e.target.value;
                          setFormState({ ...formState, conditions: newConds });
                        }}
                        className="flex-1"
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          const newConds = formState.conditions.filter((_, i) => i !== idx);
                          setFormState({ ...formState, conditions: newConds });
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setFormState({
                        ...formState,
                        conditions: [
                          ...formState.conditions,
                          { field: "", operator: "equals", value: "" },
                        ],
                      });
                    }}
                  >
                    + Condizione
                  </Button>
                </div>
              </div>

              {/* Actions */}
              <div>
                <Label>Azioni</Label>
                <div className="space-y-2 mt-2">
                  {formState.actions.map((action, idx) => (
                    <div key={idx} className="flex gap-2 items-start">
                      <select
                        value={action.action_type}
                        onChange={(e) => {
                          const newActions = [...formState.actions];
                          newActions[idx].action_type = e.target.value;
                          setFormState({ ...formState, actions: newActions });
                        }}
                        className="rounded-md border border-input bg-background px-3 py-2 flex-1"
                      >
                        {ACTION_TYPE_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                      <Input
                        placeholder="Parametri JSON"
                        value={JSON.stringify(action.parameters)}
                        onChange={(e) => {
                          const newActions = [...formState.actions];
                          try {
                            newActions[idx].parameters = JSON.parse(e.target.value);
                          } catch {
                            // Ignore parse errors while typing
                          }
                          setFormState({ ...formState, actions: newActions });
                        }}
                        className="flex-1"
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          const newActions = formState.actions.filter((_, i) => i !== idx);
                          setFormState({ ...formState, actions: newActions });
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setFormState({
                        ...formState,
                        actions: [
                          ...formState.actions,
                          { action_type: "update_field", parameters: {} },
                        ],
                      });
                    }}
                  >
                    + Azione
                  </Button>
                </div>
              </div>

              {/* Advanced Settings */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <Label htmlFor="priority">Priorità</Label>
                  <Input
                    id="priority"
                    type="number"
                    value={formState.priority}
                    onChange={(e) =>
                      setFormState({ ...formState, priority: parseInt(e.target.value) || 0 })
                    }
                    min="1"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="cooldown">Cooldown (min)</Label>
                  <Input
                    id="cooldown"
                    type="number"
                    value={formState.cooldown_minutes ?? ""}
                    onChange={(e) =>
                      setFormState({
                        ...formState,
                        cooldown_minutes: e.target.value ? parseInt(e.target.value) : null,
                      })
                    }
                    placeholder="Opzionale"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="max-exec">Max Esecuzioni</Label>
                  <Input
                    id="max-exec"
                    type="number"
                    value={formState.max_executions ?? ""}
                    onChange={(e) =>
                      setFormState({
                        ...formState,
                        max_executions: e.target.value ? parseInt(e.target.value) : null,
                      })
                    }
                    placeholder="Opzionale"
                    className="mt-1"
                  />
                </div>
              </div>

              {/* Save Button */}
              <Button
                onClick={handleSave}
                disabled={createRule.isPending || updateRule.isPending}
                className="w-full"
              >
                {createRule.isPending || updateRule.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Salvataggio...
                  </>
                ) : (
                  "Salva Regola"
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      {!statsLoading && stats && (
        <div className="grid grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Regole Attive</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeRules}</div>
              <p className="text-xs text-muted-foreground">regole in esecuzione</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Esecuzioni Oggi</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.executionsToday}</div>
              <p className="text-xs text-muted-foreground">azioni completate</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Questa Settimana</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.executionsThisWeek}</div>
              <p className="text-xs text-muted-foreground">azioni completate</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Tabs */}
      <Tabs defaultValue="rules" className="w-full">
        <TabsList>
          <TabsTrigger value="rules">Regole</TabsTrigger>
          <TabsTrigger value="execution">Registro Esecuzioni</TabsTrigger>
        </TabsList>

        {/* Rules Tab */}
        <TabsContent value="rules" className="space-y-4">
          {rulesLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : !rules || rules.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center text-muted-foreground">
                  Nessuna regola creata. Crea la tua prima regola per iniziare!
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {rules.map((rule) => (
                <Card key={rule.id} className="hover:bg-accent/50 transition">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{rule.name}</h3>
                          <Badge variant={rule.is_active ? "default" : "secondary"}>
                            {rule.is_active ? "Attiva" : "Inattiva"}
                          </Badge>
                          <Badge variant="outline">P{rule.priority}</Badge>
                        </div>
                        {rule.description && (
                          <p className="text-sm text-muted-foreground mt-1">{rule.description}</p>
                        )}
                        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                          <span>Trigger: {rule.trigger_event}</span>
                          <span>
                            Condizioni:{" "}
                            {Array.isArray(rule.conditions) ? rule.conditions.length : 0}
                          </span>
                          <span>
                            Azioni: {Array.isArray(rule.actions) ? rule.actions.length : 0}
                          </span>
                          {rule.cooldown_minutes && (
                            <span>Cooldown: {rule.cooldown_minutes}min</span>
                          )}
                          {rule.max_executions && (
                            <span>Max: {rule.max_executions}x</span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggle(rule)}
                          title={rule.is_active ? "Disattiva" : "Attiva"}
                        >
                          {rule.is_active ? (
                            <ToggleRight className="w-5 h-5 text-green-500" />
                          ) : (
                            <ToggleLeft className="w-5 h-5 text-muted-foreground" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(rule)}
                          title="Modifica"
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(rule.id)}
                          title="Elimina"
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Execution Log Tab */}
        <TabsContent value="execution" className="space-y-4">
          {logLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : !logData?.logs || logData.logs.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center text-muted-foreground">
                  Nessuna esecuzione registrata
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {logData.logs.map((log) => (
                <Card key={log.id} className="hover:bg-accent/50 transition">
                  <CardContent className="pt-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs text-muted-foreground">
                            {log.rule_id.substring(0, 8)}...
                          </span>
                          <Badge variant={log.result === "success" ? "default" : "destructive"}>
                            {log.result === "success" ? "✓ Successo" : "✗ Errore"}
                          </Badge>
                        </div>
                        <p className="text-sm mt-1">
                          {log.target_table} / {log.target_id}
                        </p>
                        {Array.isArray(log.actions_executed) && log.actions_executed.length > 0 && (
                          <div className="text-xs text-muted-foreground mt-2">
                            Azioni: {log.actions_executed.join(", ")}
                          </div>
                        )}
                        {log.error_message && (
                          <p className="text-xs text-destructive mt-2">{log.error_message}</p>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground whitespace-nowrap">
                        {new Date(log.executed_at).toLocaleString()}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {/* Pagination */}
              <div className="flex items-center justify-between mt-4">
                <Button
                  variant="outline"
                  disabled={page === 0}
                  onClick={() => setPage(page - 1)}
                >
                  Precedente
                </Button>
                <span className="text-sm text-muted-foreground">
                  Pagina {page + 1} di {Math.ceil((logData.total || 1) / 50)}
                </span>
                <Button
                  variant="outline"
                  disabled={(page + 1) * 50 >= (logData.total || 0)}
                  onClick={() => setPage(page + 1)}
                >
                  Successivo
                </Button>
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

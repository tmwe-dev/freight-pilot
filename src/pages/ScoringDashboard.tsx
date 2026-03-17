import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { useScoringConfig, useUpdateScoringConfig, useBatchScore, useAverageDimensionScores, useScoredPartners, useScoredProspects, useEntityScore } from "@/hooks/useScoring";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

const ScoringDashboard = () => {
  const [entityType, setEntityType] = useState<"partner" | "prospect">("partner");
  const [selectedEntityId, setSelectedEntityId] = useState<string | null>(null);
  const [weights, setWeights] = useState<Record<string, number>>({});
  const [weightsModified, setWeightsModified] = useState(false);

  // Hooks
  const { data: scoringConfigs, isLoading: configLoading } = useScoringConfig();
  const { mutate: updateConfig, isPending: isUpdating } = useUpdateScoringConfig();
  const { mutate: batchScore, isPending: isScoring } = useBatchScore();
  const { data: avgScores, isLoading: avgScoresLoading } = useAverageDimensionScores(entityType);
  const { data: partners, isLoading: partnersLoading } = useScoredPartners();
  const { data: prospects, isLoading: prospectsLoading } = useScoredProspects();
  const { data: selectedEntityScore } = useEntityScore(entityType, selectedEntityId || undefined);

  // Initialize weights from config
  const initializedWeights = useMemo(() => {
    if (!scoringConfigs || scoringConfigs.length === 0) return weights;
    if (Object.keys(weights).length > 0) return weights;

    const w: Record<string, number> = {};
    scoringConfigs.forEach((cfg) => {
      w[cfg.dimension] = cfg.weight;
    });
    setWeights(w);
    return w;
  }, [scoringConfigs, weights]);

  const currentEntities = entityType === "partner" ? partners : prospects;

  // Dimension info
  const dimensions = [
    { key: "data_quality", label: "Qualità Dati", color: "#3b82f6" },
    { key: "commercial_potential", label: "Potenziale Commerciale", color: "#ef4444" },
    { key: "strategic_relevance", label: "Rilevanza Strategica", color: "#10b981" },
    { key: "circuit_status", label: "Stato Circuito", color: "#f59e0b" },
    { key: "risk", label: "Rischio", color: "#8b5cf6" },
  ];

  const handleWeightChange = (dimensionKey: string, newValue: number) => {
    setWeights((prev) => ({ ...prev, [dimensionKey]: newValue }));
    setWeightsModified(true);
  };

  const handleSaveWeights = () => {
    if (!scoringConfigs) return;

    const updates = scoringConfigs.map((cfg) => ({
      id: cfg.id,
      weight: weights[cfg.dimension] || cfg.weight,
    }));

    updateConfig(updates, {
      onSuccess: () => {
        toast.success("Pesi aggiornati con successo");
        setWeightsModified(false);
      },
      onError: () => {
        toast.error("Errore nell'aggiornamento dei pesi");
      },
    });
  };

  const handleBatchScore = () => {
    batchScore(undefined, {
      onSuccess: (result) => {
        toast.success(`Scoring completato: ${result.partnersUpdated + result.prospectsUpdated} entità aggiornate`);
      },
      onError: () => {
        toast.error("Errore durante il batch scoring");
      },
    });
  };

  // Prepare radar data for selected entity
  const radarData = useMemo(() => {
    if (!selectedEntityScore || !selectedEntityScore.score || !selectedEntityScore.score.dimensions) return [];

    return selectedEntityScore.score.dimensions.map((dim) => ({
      name: dim.label,
      value: dim.score,
    }));
  }, [selectedEntityScore]);

  // Prepare distribution data
  const distributionData = useMemo(() => {
    if (!currentEntities) return [];

    const bins = [
      { range: "0-20", count: 0 },
      { range: "21-40", count: 0 },
      { range: "41-60", count: 0 },
      { range: "61-80", count: 0 },
      { range: "81-100", count: 0 },
    ];

    currentEntities.forEach((entity) => {
      const score = entity.priority_score || 0;
      if (score <= 20) bins[0].count++;
      else if (score <= 40) bins[1].count++;
      else if (score <= 60) bins[2].count++;
      else if (score <= 80) bins[3].count++;
      else bins[4].count++;
    });

    return bins;
  }, [currentEntities]);

  const isLoading = configLoading || avgScoresLoading || partnersLoading || prospectsLoading;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Scoring Composito</h1>
            <p className="text-slate-400">Sistema di valutazione multi-dimensionale per partner e prospect</p>
          </div>
          <Button onClick={handleBatchScore} disabled={isScoring} className="gap-2 bg-blue-600 hover:bg-blue-700">
            {isScoring && <Loader2 className="h-4 w-4 animate-spin" />}
            Ricalcola Tutti
          </Button>
        </div>

        {/* Tabs for Partners/Prospects */}
        <Tabs value={entityType} onValueChange={(v) => setEntityType(v as "partner" | "prospect")} className="w-full">
          <TabsList className="bg-slate-800 border border-slate-700">
            <TabsTrigger value="partner">Partner ({partners?.length || 0})</TabsTrigger>
            <TabsTrigger value="prospect">Prospect ({prospects?.length || 0})</TabsTrigger>
          </TabsList>

          {/* Dimension Cards */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mt-6">
            {dimensions.map((dim) => {
              const currentAvg = avgScores?.find((s) => s.name === dim.key)?.avg || 0;
              const currentWeight = weights[dim.key] || 0;

              return (
                <Card key={dim.key} className="bg-slate-800 border-slate-700">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-semibold text-white">{dim.label}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-white">{currentAvg}</div>
                      <p className="text-xs text-slate-400">Media attuale</p>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <label className="text-xs text-slate-300">Peso</label>
                        <span className="text-sm font-semibold text-white">{currentWeight}%</span>
                      </div>
                      <Slider
                        value={[currentWeight]}
                        onValueChange={([v]) => handleWeightChange(dim.key, v)}
                        min={0}
                        max={50}
                        step={1}
                        className="cursor-pointer"
                      />
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Main Content */}
          <TabsContent value={entityType} className="space-y-6 mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Radar Chart */}
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">Profilo Dimensioni</CardTitle>
                  <CardDescription className="text-slate-400">
                    {selectedEntityId ? "Entità selezionata" : "Seleziona un'entità dalla tabella"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {radarData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <RadarChart data={radarData}>
                        <PolarGrid stroke="#334155" />
                        <PolarAngleAxis dataKey="name" stroke="#94a3b8" tick={{ fontSize: 12 }} />
                        <PolarRadiusAxis stroke="#94a3b8" angle={90} domain={[0, 100]} />
                        <Radar name="Score" dataKey="value" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} />
                        <Tooltip contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #475569", borderRadius: "8px" }} />
                      </RadarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-[300px] flex items-center justify-center text-slate-400">
                      Seleziona un'entità per visualizzare il profilo
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Distribution Chart */}
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">Distribuzione Score</CardTitle>
                  <CardDescription className="text-slate-400">Tutti i {entityType === "partner" ? "partner" : "prospect"}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={distributionData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                      <XAxis dataKey="range" stroke="#94a3b8" />
                      <YAxis stroke="#94a3b8" />
                      <Tooltip contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #475569", borderRadius: "8px" }} />
                      <Bar dataKey="count" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Entities Table */}
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">
                  Top Scored {entityType === "partner" ? "Partner" : "Prospect"}
                </CardTitle>
                <CardDescription className="text-slate-400">
                  Classifica per score composito
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-700">
                        <th className="text-left py-3 px-4 text-slate-300 font-semibold">Nome</th>
                        <th className="text-right py-3 px-4 text-slate-300 font-semibold">Score</th>
                        <th className="text-left py-3 px-4 text-slate-300 font-semibold">Status</th>
                        <th className="text-left py-3 px-4 text-slate-300 font-semibold">Paese</th>
                        <th className="text-right py-3 px-4 text-slate-300 font-semibold">Interazioni</th>
                      </tr>
                    </thead>
                    <tbody>
                      {isLoading ? (
                        <tr>
                          <td colSpan={5} className="text-center py-8">
                            <Loader2 className="h-6 w-6 animate-spin mx-auto text-blue-400" />
                          </td>
                        </tr>
                      ) : currentEntities && currentEntities.length > 0 ? (
                        currentEntities.slice(0, 20).map((entity) => {
                          const scorePercent = Math.min(100, entity.priority_score || 0);
                          const isSelected = selectedEntityId === entity.id;

                          return (
                            <tr
                              key={entity.id}
                              onClick={() => setSelectedEntityId(entity.id)}
                              className={`border-b border-slate-700 cursor-pointer transition ${
                                isSelected ? "bg-slate-700" : "hover:bg-slate-700/50"
                              }`}
                            >
                              <td className="py-3 px-4 text-white font-medium">{entity.company_name}</td>
                              <td className="py-3 px-4 text-right">
                                <div className="flex items-center justify-end gap-2">
                                  <div className="w-16 h-2 bg-slate-700 rounded-full overflow-hidden">
                                    <div
                                      className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all"
                                      style={{ width: `${scorePercent}%` }}
                                    />
                                  </div>
                                  <span className="text-white font-semibold w-8 text-right">{entity.priority_score || 0}</span>
                                </div>
                              </td>
                              <td className="py-3 px-4">
                                <span
                                  className={`px-2 py-1 rounded text-xs font-semibold ${
                                    entity.lead_status === "converted"
                                      ? "bg-green-900/30 text-green-400"
                                      : entity.lead_status === "hot"
                                        ? "bg-red-900/30 text-red-400"
                                        : "bg-yellow-900/30 text-yellow-400"
                                  }`}
                                >
                                  {entity.lead_status}
                                </span>
                              </td>
                              <td className="py-3 px-4 text-slate-300">{entity.country_code}</td>
                              <td className="py-3 px-4 text-right text-slate-300">{entity.interaction_count || 0}</td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td colSpan={5} className="text-center py-8 text-slate-400">
                            Nessuna entità trovata
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Settings Panel */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Configurazione Pesi</CardTitle>
            <CardDescription className="text-slate-400">
              Regola i pesi delle 5 dimensioni (devono sommare a 100%)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {dimensions.map((dim) => {
                const currentWeight = weights[dim.key] || 0;
                const totalWeight = Object.values(weights).reduce((a, b) => a + b, 0);

                return (
                  <div key={dim.key} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <label className="text-sm font-semibold text-white">{dim.label}</label>
                      <span className="text-sm text-slate-400">
                        {currentWeight}% {totalWeight > 0 && <span>({Math.round((currentWeight / totalWeight) * 100)}% della somma)</span>}
                      </span>
                    </div>
                    <Slider
                      value={[currentWeight]}
                      onValueChange={([v]) => handleWeightChange(dim.key, v)}
                      min={0}
                      max={100}
                      step={1}
                      className="cursor-pointer"
                    />
                  </div>
                );
              })}

              <div className="pt-4 border-t border-slate-700">
                <div className="flex justify-between items-center mb-4">
                  <span className="font-semibold text-white">Somma totale</span>
                  <span className={`font-bold ${Object.values(weights).reduce((a, b) => a + b, 0) === 100 ? "text-green-400" : "text-red-400"}`}>
                    {Object.values(weights).reduce((a, b) => a + b, 0)}%
                  </span>
                </div>

                <div className="flex gap-4">
                  <Button
                    onClick={handleSaveWeights}
                    disabled={
                      isUpdating ||
                      !weightsModified ||
                      Object.values(weights).reduce((a, b) => a + b, 0) !== 100
                    }
                    className="flex-1 bg-green-600 hover:bg-green-700"
                  >
                    {isUpdating ? "Salvataggio..." : "Salva Configurazione"}
                  </Button>
                  <Button
                    onClick={() => {
                      setWeights(initializedWeights);
                      setWeightsModified(false);
                    }}
                    variant="outline"
                    className="flex-1 border-slate-600 hover:bg-slate-700"
                  >
                    Annulla
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ScoringDashboard;

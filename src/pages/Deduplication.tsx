import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  ChevronDown,
  ChevronRight,
  Loader2,
  Zap,
  AlertCircle,
  CheckCircle2,
  Clock,
} from "lucide-react";
import {
  useDedupClusters,
  useDedupStats,
  useRunDedup,
  useResolveCluster,
  type DedupCluster,
  type DedupClusterMember,
} from "@/hooks/useDedupClusters";

function getMatchLevelColor(
  level: "exact" | "strong" | "fuzzy"
): "default" | "secondary" | "outline" {
  switch (level) {
    case "exact":
      return "default";
    case "strong":
      return "secondary";
    case "fuzzy":
      return "outline";
  }
}

function getMatchLevelLabel(
  level: "exact" | "strong" | "fuzzy"
): string {
  switch (level) {
    case "exact":
      return "Esatto (Email)";
    case "strong":
      return "Forte (Azienda + Città)";
    case "fuzzy":
      return "Fuzzy (Somiglianza)";
  }
}

function getStatusColor(
  status: "pending" | "resolved" | "ignored"
): "default" | "secondary" | "destructive" {
  switch (status) {
    case "pending":
      return "secondary";
    case "resolved":
      return "default";
    case "ignored":
      return "destructive";
  }
}

function getStatusLabel(
  status: "pending" | "resolved" | "ignored"
): string {
  switch (status) {
    case "pending":
      return "In Sospeso";
    case "resolved":
      return "Risolto";
    case "ignored":
      return "Ignorato";
  }
}

interface ExpandedRows {
  [clusterId: string]: boolean;
}

interface ClusterDialogState {
  open: boolean;
  cluster: DedupCluster | null;
  masterId?: string;
}

export default function Deduplication() {
  const { data: clusters, isLoading: clustersLoading } = useDedupClusters();
  const { data: stats } = useDedupStats();
  const { mutate: runDedup, isPending: dedupPending } = useRunDedup();
  const { mutate: resolveCluster } = useResolveCluster();

  const [expandedRows, setExpandedRows] = useState<ExpandedRows>({});
  const [dialogState, setDialogState] = useState<ClusterDialogState>({
    open: false,
    cluster: null,
  });

  const toggleRow = (clusterId: string) => {
    setExpandedRows((prev) => ({
      ...prev,
      [clusterId]: !prev[clusterId],
    }));
  };

  const openMergeDialog = (cluster: DedupCluster) => {
    setDialogState({ open: true, cluster });
  };

  const handleMerge = (masterId: string) => {
    if (dialogState.cluster) {
      resolveCluster({
        clusterId: dialogState.cluster.id,
        action: "merge",
        masterId,
      });
      setDialogState({ open: false, cluster: null });
    }
  };

  const handleIgnore = (clusterId: string) => {
    resolveCluster({
      clusterId,
      action: "ignore",
    });
  };

  const handleReview = (clusterId: string) => {
    resolveCluster({
      clusterId,
      action: "pending",
    });
  };

  const pendingClusters = clusters?.filter((c) => c.status === "pending") ?? [];
  const resolvedClusters = clusters?.filter((c) => c.status === "resolved") ?? [];

  return (
    <div className="flex-1 overflow-auto p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Deduplicazione Cross-Import</h1>
        <p className="text-sm text-muted-foreground">
          Rileva e gestisci i contatti duplicati tra Partners, Contatti Importati
          e Prospect
        </p>
      </div>

      {/* Action Bar */}
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <Button
            onClick={() => runDedup()}
            disabled={dedupPending}
            className="gap-2"
          >
            {dedupPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Zap className="w-4 h-4" />
            )}
            {dedupPending ? "Scansione in corso..." : "Esegui Scansione"}
          </Button>
        </div>
        <div className="text-xs text-muted-foreground">
          Ultimo aggiornamento: {clusters?.[0]?.created_at
            ? new Date(clusters[0].created_at).toLocaleString("it-IT")
            : "Mai"}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Cluster Totali
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.total ?? 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats?.totalDuplicates ?? 0} duplicati rilevati
            </p>
          </CardContent>
        </Card>

        <Card className="border-yellow-200/50 bg-yellow-50/30 dark:bg-yellow-950/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Clock className="w-4 h-4 text-yellow-600" />
              In Sospeso
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-700 dark:text-yellow-400">
              {stats?.pending ?? 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Attendono revisione
            </p>
          </CardContent>
        </Card>

        <Card className="border-green-200/50 bg-green-50/30 dark:bg-green-950/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-600" />
              Risolti
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-700 dark:text-green-400">
              {stats?.resolved ?? 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Uniti o ignorati</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Tabelle Coinvolte</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground mt-1">
              Partners, Imported, Prospects
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Cluster di Duplicati</CardTitle>
        </CardHeader>
        <CardContent>
          {clustersLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : !clusters || clusters.length === 0 ? (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Nessun cluster rilevato. Esegui una scansione per iniziare.
              </AlertDescription>
            </Alert>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-8" />
                    <TableHead>Match Level</TableHead>
                    <TableHead>Match Key</TableHead>
                    <TableHead className="text-right">Membri</TableHead>
                    <TableHead className="text-right">Score</TableHead>
                    <TableHead>Stato</TableHead>
                    <TableHead className="text-right">Azioni</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {clusters.map((cluster) => (
                    <div key={cluster.id}>
                      <TableRow
                        className="hover:bg-muted/50 cursor-pointer"
                        onClick={() => toggleRow(cluster.id)}
                      >
                        <TableCell className="w-8">
                          {expandedRows[cluster.id] ? (
                            <ChevronDown className="w-4 h-4" />
                          ) : (
                            <ChevronRight className="w-4 h-4" />
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant={getMatchLevelColor(cluster.match_level)}>
                            {getMatchLevelLabel(cluster.match_level)}
                          </Badge>
                        </TableCell>
                        <TableCell className="max-w-xs truncate text-sm">
                          {cluster.match_key}
                        </TableCell>
                        <TableCell className="text-right">
                          {cluster.members?.length ?? 0}
                        </TableCell>
                        <TableCell className="text-right text-sm">
                          {cluster.members?.[0]?.match_score
                            ? (cluster.members[0].match_score * 100).toFixed(0) + "%"
                            : "—"}
                        </TableCell>
                        <TableCell>
                          <Badge variant={getStatusColor(cluster.status)}>
                            {getStatusLabel(cluster.status)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          {cluster.status === "pending" && (
                            <div className="flex justify-end gap-1">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openMergeDialog(cluster);
                                }}
                              >
                                Unisci
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleIgnore(cluster.id);
                                }}
                              >
                                Ignora
                              </Button>
                            </div>
                          )}
                          {cluster.status !== "pending" && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleReview(cluster.id);
                              }}
                            >
                              Rivedi
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>

                      {/* Expanded Row - Members */}
                      {expandedRows[cluster.id] && (
                        <TableRow className="bg-muted/30 hover:bg-muted/30">
                          <TableCell colSpan={7} className="p-4">
                            <div className="space-y-3">
                              <h4 className="font-medium text-sm">Membri del Cluster</h4>
                              <div className="space-y-2">
                                {cluster.members?.map((member) => (
                                  <div
                                    key={member.id}
                                    className="p-3 bg-background border rounded-md text-sm"
                                  >
                                    <div className="flex items-start justify-between gap-4">
                                      <div className="flex-1 space-y-1">
                                        <div className="flex items-center gap-2">
                                          <Badge variant="outline">
                                            {member.source_table}
                                          </Badge>
                                          {member.is_master && (
                                            <Badge className="bg-blue-600">
                                              Master
                                            </Badge>
                                          )}
                                        </div>
                                        <div className="text-xs text-muted-foreground space-y-1">
                                          {member.field_snapshot?.company_name && (
                                            <div>
                                              <strong>Azienda:</strong>{" "}
                                              {member.field_snapshot.company_name}
                                            </div>
                                          )}
                                          {member.field_snapshot?.email && (
                                            <div>
                                              <strong>Email:</strong>{" "}
                                              {member.field_snapshot.email}
                                            </div>
                                          )}
                                          {member.field_snapshot?.city && (
                                            <div>
                                              <strong>Città:</strong>{" "}
                                              {member.field_snapshot.city}
                                            </div>
                                          )}
                                          {member.match_score !== null && (
                                            <div>
                                              <strong>Score:</strong>{" "}
                                              {(member.match_score * 100).toFixed(0)}%
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                      {cluster.status === "pending" && !member.is_master && (
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          onClick={() => handleMerge(member.source_id)}
                                        >
                                          Imposta Master
                                        </Button>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </div>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Merge Dialog */}
      <Dialog open={dialogState.open} onOpenChange={(open) => {
        setDialogState({ ...dialogState, open });
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Unisci Contatti</DialogTitle>
            <DialogDescription>
              Seleziona quale record mantenere come master. Gli altri verranno
              considerati duplicati.
            </DialogDescription>
          </DialogHeader>

          {dialogState.cluster && (
            <div className="space-y-4">
              {dialogState.cluster.members?.map((member) => (
                <div
                  key={member.id}
                  className="p-3 border rounded-md cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => handleMerge(member.source_id)}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-1 space-y-1">
                      <div className="font-medium text-sm">
                        {member.field_snapshot?.company_name ||
                          member.field_snapshot?.name ||
                          "Senza Nome"}
                      </div>
                      <div className="text-xs text-muted-foreground space-y-0.5">
                        <div>
                          <strong>Fonte:</strong> {member.source_table}
                        </div>
                        {member.field_snapshot?.email && (
                          <div>
                            <strong>Email:</strong> {member.field_snapshot.email}
                          </div>
                        )}
                      </div>
                    </div>
                    <Button size="sm" variant="outline">
                      Seleziona
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CarouselEngine,
  GlassCard,
  AICompanion,
} from "@/components/platform";
import {
  TrendingUp,
  Users,
  Zap,
  BarChart3,
  Settings,
  GitBranch,
  Wifi,
  User,
  Download,
  Upload,
  Activity,
  AlertCircle,
  CheckCircle,
  PieChart,
  LineChart as LineChartIcon,
  BarChart4,
  Radar,
  ArrowUp,
  ArrowDown,
  Eye,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Mock data structures
interface KPIData {
  label: string;
  value: number;
  icon: any;
  trend: number;
  color: string;
}

interface ChartDataPoint {
  name: string;
  value: number;
  percentage?: number;
}

interface DeduplicationStats {
  clustersFound: number;
  merged: number;
  pending: number;
}

interface SystemHealth {
  component: string;
  status: "healthy" | "warning" | "error";
  lastCheck: string;
}

// Mock KPI data
const MOCK_KPIS: KPIData[] = [
  { label: "Total Partners", value: 342, icon: Users, trend: 12, color: "blue" },
  { label: "Active Circuits", value: 87, icon: Zap, trend: 8, color: "purple" },
  { label: "Conversion Rate", value: 14.2, icon: TrendingUp, trend: 2.3, color: "green" },
  { label: "Campaigns Running", value: 23, icon: BarChart3, trend: -1, color: "orange" },
];

const MOCK_ACQUISITION_DATA: ChartDataPoint[] = [
  { name: "Week 1", value: 45 },
  { name: "Week 2", value: 52 },
  { name: "Week 3", value: 48 },
  { name: "Week 4", value: 67 },
  { name: "Week 5", value: 78 },
  { name: "Week 6", value: 85 },
  { name: "Week 7", value: 92 },
];

const MOCK_STAGE_DATA: ChartDataPoint[] = [
  { name: "Nuovo", value: 45, percentage: 28 },
  { name: "Contattato", value: 38, percentage: 23 },
  { name: "Lavorazione", value: 42, percentage: 26 },
  { name: "Negoziazione", value: 22, percentage: 14 },
  { name: "Convertito", value: 12, percentage: 7 },
  { name: "Perso", value: 3, percentage: 2 },
];

const MOCK_SOURCE_DATA: ChartDataPoint[] = [
  { name: "LinkedIn", value: 45, percentage: 38 },
  { name: "Email", value: 35, percentage: 30 },
  { name: "Direct", value: 20, percentage: 17 },
  { name: "Referral", value: 18, percentage: 15 },
];

const MOCK_RADAR_DATA = [
  { dimension: "Engagement", value: 78 },
  { dimension: "Quality", value: 85 },
  { dimension: "Conversion", value: 62 },
  { dimension: "Retention", value: 91 },
  { dimension: "Growth", value: 73 },
];

const MOCK_TOP_CONTACTS = [
  { name: "Marco Rossi", company: "Logistica Italia", score: 98 },
  { name: "Sofia Gallo", company: "ShipFast", score: 94 },
  { name: "Roberto Conti", company: "Port Authority", score: 92 },
  { name: "Francesca Lini", company: "Premium Shipping", score: 89 },
  { name: "Elena Moretti", company: "Freight Solutions", score: 87 },
  { name: "Davide Neri", company: "Trade Hub", score: 85 },
  { name: "Paolo Sala", company: "Global Moves", score: 82 },
  { name: "Giulia Martini", company: "Express Route", score: 79 },
  { name: "Carlo Rizzo", company: "Ocean Logistics", score: 75 },
  { name: "Luca Bianchi", company: "Cargo Express", score: 72 },
];

const MOCK_DEDUP_STATS: DeduplicationStats = {
  clustersFound: 34,
  merged: 28,
  pending: 6,
};

const MOCK_SYSTEM_HEALTH: SystemHealth[] = [
  { component: "API Gateway", status: "healthy", lastCheck: "2 min ago" },
  { component: "Database", status: "healthy", lastCheck: "1 min ago" },
  { component: "Email Service", status: "warning", lastCheck: "5 min ago" },
  { component: "LinkedIn Integration", status: "healthy", lastCheck: "3 min ago" },
];

// CountUp component for animated numbers
function CountUp({ target, duration = 1 }: { target: number; duration?: number }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime: number;
    let animationFrame: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / (duration * 1000), 1);
      setCount(Math.floor(progress * target));
      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [target, duration]);

  return <span>{count}</span>;
}

// Canvas 1: Dashboard KPI
function DashboardKPICanvas() {
  return (
    <div className="w-full h-full p-6 flex flex-col gap-6 overflow-hidden">
      <div>
        <h2 className="text-2xl font-bold text-white mb-1">Dashboard KPI</h2>
        <p className="text-white/50 text-sm">Panoramica in tempo reale delle metriche chiave</p>
      </div>

      <div className="flex-1 flex flex-col gap-6 overflow-hidden">
        {/* KPI Cards */}
        <div className="grid grid-cols-4 gap-4">
          {MOCK_KPIS.map((kpi, idx) => {
            const Icon = kpi.icon;
            const isPositive = kpi.trend >= 0;
            const TrendIcon = isPositive ? ArrowUp : ArrowDown;

            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1, type: "spring", stiffness: 100 }}
              >
                <GlassCard variant="highlighted" className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className={`p-2 rounded-lg bg-${kpi.color}-500/20`}>
                      <Icon className={`w-5 h-5 text-${kpi.color}-400`} />
                    </div>
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: idx * 0.1 + 0.3 }}
                      className={cn(
                        "flex items-center gap-1 text-xs px-2 py-1 rounded-full",
                        isPositive
                          ? "bg-green-500/20 text-green-300"
                          : "bg-red-500/20 text-red-300"
                      )}
                    >
                      <TrendIcon className="w-3 h-3" />
                      <span>{Math.abs(kpi.trend)}</span>
                    </motion.div>
                  </div>

                  <motion.div
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: idx * 0.1 + 0.2, type: "spring", stiffness: 150 }}
                    className="text-3xl font-bold text-white mb-1"
                  >
                    {typeof kpi.value === "number" && kpi.value % 1 !== 0 ? (
                      <CountUp target={Math.round(kpi.value * 10)} duration={0.8} />
                    ) : (
                      <CountUp target={kpi.value} duration={0.8} />
                    )}
                    {typeof kpi.value !== "number" || kpi.value % 1 !== 0 ? (
                      <span className="text-xl">%</span>
                    ) : null}
                  </motion.div>

                  <p className="text-xs text-white/60">{kpi.label}</p>
                </GlassCard>
              </motion.div>
            );
          })}
        </div>

        {/* Charts Grid */}
        <div className="flex-1 grid grid-cols-3 gap-4 overflow-hidden">
          {/* Line Chart - Acquisition */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="overflow-hidden"
          >
            <GlassCard className="h-full p-4 flex flex-col">
              <div className="flex items-center gap-2 mb-4">
                <LineChartIcon className="w-4 h-4 text-blue-400" />
                <h3 className="text-sm font-semibold text-white">Contact Acquisition</h3>
              </div>
              <div className="flex-1 flex items-end gap-1">
                {MOCK_ACQUISITION_DATA.map((point, idx) => {
                  const maxValue = Math.max(...MOCK_ACQUISITION_DATA.map(d => d.value));
                  const height = (point.value / maxValue) * 100;

                  return (
                    <motion.div
                      key={idx}
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: `${height}%`, opacity: 1 }}
                      transition={{ delay: 0.4 + idx * 0.05, type: "spring", stiffness: 100 }}
                      className="flex-1 rounded-t bg-gradient-to-t from-blue-500/40 to-blue-500/20 border-t border-blue-500/60 hover:from-blue-500/60 hover:to-blue-500/40 transition-all cursor-pointer"
                      title={`${point.name}: ${point.value}`}
                    />
                  );
                })}
              </div>
            </GlassCard>
          </motion.div>

          {/* Bar Chart - Stage Distribution */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="overflow-hidden"
          >
            <GlassCard className="h-full p-4 flex flex-col">
              <div className="flex items-center gap-2 mb-4">
                <BarChart4 className="w-4 h-4 text-purple-400" />
                <h3 className="text-sm font-semibold text-white">Contacts per Stage</h3>
              </div>
              <div className="flex-1 flex items-end gap-2">
                {MOCK_STAGE_DATA.map((point, idx) => {
                  const maxValue = Math.max(...MOCK_STAGE_DATA.map(d => d.value));
                  const height = (point.value / maxValue) * 100;

                  return (
                    <motion.div
                      key={idx}
                      className="flex-1 flex flex-col items-center gap-1"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.5 + idx * 0.05 }}
                    >
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: `${height}%` }}
                        transition={{ delay: 0.5 + idx * 0.05 + 0.1, type: "spring" }}
                        className="w-full rounded-t bg-gradient-to-t from-purple-500/40 to-purple-500/20 border-t border-purple-500/60 hover:from-purple-500/60 hover:to-purple-500/40 transition-all cursor-pointer"
                        title={`${point.name}: ${point.value}`}
                      />
                      <span className="text-xs text-white/60 mt-1">{point.percentage}%</span>
                    </motion.div>
                  );
                })}
              </div>
            </GlassCard>
          </motion.div>

          {/* Pie Chart - Source Distribution */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="overflow-hidden"
          >
            <GlassCard className="h-full p-4 flex flex-col">
              <div className="flex items-center gap-2 mb-4">
                <PieChart className="w-4 h-4 text-green-400" />
                <h3 className="text-sm font-semibold text-white">Contacts by Source</h3>
              </div>
              <div className="flex-1 flex items-center justify-center">
                <svg viewBox="0 0 100 100" className="w-full h-full max-w-40">
                  {MOCK_SOURCE_DATA.map((point, idx) => {
                    const total = MOCK_SOURCE_DATA.reduce((sum, d) => sum + d.value, 0);
                    const startAngle = MOCK_SOURCE_DATA.slice(0, idx).reduce((sum, d) => sum + (d.value / total) * 360, 0);
                    const sweepAngle = (point.value / total) * 360;

                    const colors = ["#3b82f6", "#ec4899", "#f59e0b", "#8b5cf6"];
                    const startRad = (startAngle * Math.PI) / 180;
                    const endRad = ((startAngle + sweepAngle) * Math.PI) / 180;

                    const x1 = 50 + 30 * Math.cos(startRad);
                    const y1 = 50 + 30 * Math.sin(startRad);
                    const x2 = 50 + 30 * Math.cos(endRad);
                    const y2 = 50 + 30 * Math.sin(endRad);

                    const largeArc = sweepAngle > 180 ? 1 : 0;

                    return (
                      <motion.path
                        key={idx}
                        d={`M 50 50 L ${x1} ${y1} A 30 30 0 ${largeArc} 1 ${x2} ${y2} Z`}
                        fill={colors[idx % colors.length]}
                        fillOpacity="0.3"
                        stroke={colors[idx % colors.length]}
                        strokeWidth="1"
                        initial={{ opacity: 0, pathLength: 0 }}
                        animate={{ opacity: 1, pathLength: 1 }}
                        transition={{ delay: 0.6 + idx * 0.1, duration: 0.8 }}
                      />
                    );
                  })}
                </svg>
              </div>
              <div className="mt-2 space-y-1 text-xs">
                {MOCK_SOURCE_DATA.map((point, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 + idx * 0.05 }}
                    className="flex items-center justify-between text-white/70"
                  >
                    <span>{point.name}</span>
                    <span>{point.percentage}%</span>
                  </motion.div>
                ))}
              </div>
            </GlassCard>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

// Canvas 2: Score & Analytics
function ScoreAnalyticsCanvas() {
  const [timePeriod, setTimePeriod] = useState("current");

  return (
    <div className="w-full h-full p-6 flex flex-col gap-6 overflow-hidden">
      <div>
        <h2 className="text-2xl font-bold text-white mb-1">Score & Analytics</h2>
        <p className="text-white/50 text-sm">Analisi dettagliata dei scoring e deduplica</p>
      </div>

      <div className="flex-1 grid grid-cols-3 gap-6 overflow-hidden">
        {/* Radar Chart */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="overflow-hidden"
        >
          <GlassCard className="h-full p-4 flex flex-col">
            <p className="text-sm font-semibold text-white mb-4">Scoring Dimensions</p>
            <div className="flex-1 flex items-center justify-center">
              <svg viewBox="0 0 100 100" className="w-full h-full max-w-48">
                {/* Radar grid */}
                {[20, 40, 60, 80].map((r) => (
                  <circle
                    key={r}
                    cx="50"
                    cy="50"
                    r={r * 0.3}
                    fill="none"
                    stroke="rgba(255,255,255,0.1)"
                    strokeWidth="0.5"
                  />
                ))}

                {/* Radar plot */}
                {MOCK_RADAR_DATA.map((point, idx) => {
                  const angle = (idx / MOCK_RADAR_DATA.length) * 2 * Math.PI - Math.PI / 2;
                  const radius = (point.value / 100) * 20;
                  return (
                    <g key={idx}>
                      <line
                        x1="50"
                        y1="50"
                        x2={50 + 20 * Math.cos(angle)}
                        y2={50 + 20 * Math.sin(angle)}
                        stroke="rgba(255,255,255,0.1)"
                        strokeWidth="0.5"
                      />
                      <motion.circle
                        cx={50 + radius * Math.cos(angle)}
                        cy={50 + radius * Math.sin(angle)}
                        r="1.5"
                        fill="#3b82f6"
                        initial={{ r: 0 }}
                        animate={{ r: 1.5 }}
                        transition={{ delay: 0.3 + idx * 0.05 }}
                      />
                    </g>
                  );
                })}

                {/* Radar points polygon */}
                <motion.polygon
                  points={MOCK_RADAR_DATA.map((point, idx) => {
                    const angle = (idx / MOCK_RADAR_DATA.length) * 2 * Math.PI - Math.PI / 2;
                    const radius = (point.value / 100) * 20;
                    return `${50 + radius * Math.cos(angle)},${50 + radius * Math.sin(angle)}`;
                  }).join(" ")}
                  fill="rgba(59, 130, 246, 0.2)"
                  stroke="rgba(59, 130, 246, 0.5)"
                  strokeWidth="0.5"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                />
              </svg>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
              {MOCK_RADAR_DATA.map((point, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + idx * 0.05 }}
                  className="flex items-center justify-between text-white/70"
                >
                  <span>{point.dimension}</span>
                  <span className="font-semibold">{point.value}</span>
                </motion.div>
              ))}
            </div>
          </GlassCard>
        </motion.div>

        {/* Middle: Score histogram and dedup stats */}
        <div className="flex flex-col gap-4 overflow-hidden">
          {/* Score distribution */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="overflow-hidden"
          >
            <GlassCard className="p-4 h-40">
              <p className="text-sm font-semibold text-white mb-3">Score Distribution</p>
              <div className="flex items-end gap-1 h-24">
                {[0, 10, 20, 30, 40, 50, 60, 70, 80, 90].map((bin, idx) => {
                  const value = Math.floor(Math.random() * 80) + 20;
                  return (
                    <motion.div
                      key={idx}
                      initial={{ height: 0 }}
                      animate={{ height: `${value}%` }}
                      transition={{ delay: 0.4 + idx * 0.03, type: "spring" }}
                      className="flex-1 rounded-t bg-gradient-to-t from-cyan-500/40 to-cyan-500/20 border-t border-cyan-500/60 hover:from-cyan-500/60 hover:to-cyan-500/40 transition-all cursor-pointer"
                      title={`${bin}-${bin + 10}: ${value} contacts`}
                    />
                  );
                })}
              </div>
            </GlassCard>
          </motion.div>

          {/* Deduplication Stats */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex-1"
          >
            <GlassCard className="p-4 flex flex-col">
              <p className="text-sm font-semibold text-white mb-4">Deduplication Stats</p>
              <div className="space-y-3 flex-1">
                {[
                  { label: "Clusters Found", value: MOCK_DEDUP_STATS.clustersFound, icon: AlertCircle, color: "yellow" },
                  { label: "Merged", value: MOCK_DEDUP_STATS.merged, icon: CheckCircle, color: "green" },
                  { label: "Pending", value: MOCK_DEDUP_STATS.pending, icon: Clock, color: "blue" },
                ].map((item, idx) => {
                  const Icon = item.icon;
                  return (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 + idx * 0.1 }}
                      className="flex items-center gap-3 p-2 rounded-lg bg-white/5 border border-white/10"
                    >
                      <Icon className={`w-4 h-4 text-${item.color}-400`} />
                      <div className="flex-1">
                        <p className="text-xs text-white/60">{item.label}</p>
                        <p className="text-sm font-semibold text-white">{item.value}</p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </GlassCard>
          </motion.div>
        </div>

        {/* Right: Top contacts */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="overflow-hidden"
        >
          <GlassCard className="p-4 flex flex-col h-full">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-semibold text-white">Top 10 Contacts</p>
              <div className="flex gap-2">
                {["current", "previous"].map((period) => (
                  <motion.button
                    key={period}
                    whileHover={{ scale: 1.05 }}
                    onClick={() => setTimePeriod(period)}
                    className={cn(
                      "px-2 py-1 rounded text-xs transition-all",
                      timePeriod === period
                        ? "bg-blue-500/30 border border-blue-500/50 text-blue-200"
                        : "bg-white/5 border border-white/10 text-white/60 hover:border-white/20"
                    )}
                  >
                    {period === "current" ? "This week" : "Last week"}
                  </motion.button>
                ))}
              </div>
            </div>

            <div className="flex-1 space-y-2 overflow-y-auto">
              {MOCK_TOP_CONTACTS.map((contact, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 + idx * 0.03 }}
                  className="p-2 rounded-lg bg-white/5 border border-white/10 hover:border-white/20 transition-all cursor-pointer group"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">{contact.name}</p>
                      <p className="text-xs text-white/50 truncate">{contact.company}</p>
                    </div>
                    <motion.div
                      initial={{ scale: 0 }}
                      whileInView={{ scale: 1 }}
                      className="text-sm font-bold text-white/80 flex-shrink-0"
                    >
                      {contact.score}
                    </motion.div>
                  </div>
                  <div className="h-1 bg-white/10 rounded-full overflow-hidden mt-1">
                    <motion.div
                      className="h-full bg-gradient-to-r from-green-500 to-blue-500"
                      initial={{ width: "0%" }}
                      whileInView={{ width: `${contact.score}%` }}
                      transition={{ delay: 0.6 + idx * 0.03 + 0.1 }}
                    />
                  </div>
                </motion.div>
              ))}
            </div>
          </GlassCard>
        </motion.div>
      </div>
    </div>
  );
}

// Canvas 3: Sistema (Settings & Health)
function SystemCanvas() {
  return (
    <div className="w-full h-full p-6 flex flex-col gap-6 overflow-hidden">
      <div>
        <h2 className="text-2xl font-bold text-white mb-1">Sistema</h2>
        <p className="text-white/50 text-sm">Configurazione, integrazioni, e salute del sistema</p>
      </div>

      <div className="flex-1 grid grid-cols-2 gap-6 overflow-hidden">
        {/* Left column */}
        <div className="flex flex-col gap-4 overflow-hidden">
          {/* Workflow Rules */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="overflow-hidden"
          >
            <GlassCard className="p-4 flex-1 flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <GitBranch className="w-4 h-4 text-purple-400" />
                  <p className="text-sm font-semibold text-white">Workflow Rules</p>
                </div>
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="w-2 h-2 rounded-full bg-green-500"
                />
              </div>
              <div className="space-y-2">
                {[
                  "Auto-assign to stage",
                  "Email on conversion",
                  "LinkedIn sync",
                  "Weekly digest",
                ].map((rule, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 + idx * 0.05 }}
                    className="flex items-center justify-between p-2 rounded-lg bg-white/5 border border-white/10 hover:border-white/20 transition-all"
                  >
                    <span className="text-sm text-white/80">{rule}</span>
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      className="w-5 h-5 rounded border border-white/20 flex items-center justify-center cursor-pointer"
                    >
                      <div className="w-2 h-2 rounded-full bg-white/60" />
                    </motion.div>
                  </motion.div>
                ))}
              </div>
            </GlassCard>
          </motion.div>

          {/* API Connections */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="overflow-hidden"
          >
            <GlassCard className="p-4 flex-1 flex flex-col">
              <div className="flex items-center gap-2 mb-4">
                <Wifi className="w-4 h-4 text-blue-400" />
                <p className="text-sm font-semibold text-white">API Connections</p>
              </div>
              <div className="space-y-2">
                {[
                  { name: "LinkedIn", active: true },
                  { name: "Gmail", active: true },
                  { name: "Slack", active: false },
                  { name: "Zapier", active: true },
                ].map((api, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + idx * 0.05 }}
                    className="flex items-center justify-between p-2 rounded-lg bg-white/5 border border-white/10"
                  >
                    <span className="text-sm text-white/80">{api.name}</span>
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className={cn(
                        "w-2 h-2 rounded-full",
                        api.active ? "bg-green-500" : "bg-red-500"
                      )}
                    />
                  </motion.div>
                ))}
              </div>
            </GlassCard>
          </motion.div>
        </div>

        {/* Right column */}
        <div className="flex flex-col gap-4 overflow-hidden">
          {/* System Health */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="overflow-hidden"
          >
            <GlassCard className="p-4 flex-1 flex flex-col">
              <p className="text-sm font-semibold text-white mb-4">System Health</p>
              <div className="space-y-2">
                {MOCK_SYSTEM_HEALTH.map((item, idx) => {
                  const colors = {
                    healthy: "bg-green-500/20 border-green-500/30",
                    warning: "bg-yellow-500/20 border-yellow-500/30",
                    error: "bg-red-500/20 border-red-500/30",
                  };

                  const dotColors = {
                    healthy: "bg-green-500",
                    warning: "bg-yellow-500",
                    error: "bg-red-500",
                  };

                  return (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 + idx * 0.05 }}
                      className={cn("p-3 rounded-lg border", colors[item.status])}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <motion.div
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ duration: 2, repeat: Infinity }}
                            className={cn(
                              "w-2 h-2 rounded-full",
                              dotColors[item.status]
                            )}
                          />
                          <p className="text-sm text-white/80">{item.component}</p>
                        </div>
                        <p className="text-xs text-white/60">{item.lastCheck}</p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </GlassCard>
          </motion.div>

          {/* User & Data */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col gap-3 overflow-hidden"
          >
            {/* User Profile */}
            <GlassCard variant="highlighted" className="p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                  <User className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">Admin User</p>
                  <p className="text-xs text-white/60">admin@freightpilot.io</p>
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.02 }}
                className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-xs text-white/80 hover:border-white/40 transition-all"
              >
                Edit Profile
              </motion.button>
            </GlassCard>

            {/* Data Management */}
            <GlassCard className="p-4">
              <p className="text-sm font-semibold text-white mb-3">Data Management</p>
              <div className="space-y-2">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 border border-white/10 hover:border-white/20 text-white/80 text-sm transition-all"
                >
                  <Download className="w-4 h-4" />
                  Export Data
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 border border-white/10 hover:border-white/20 text-white/80 text-sm transition-all"
                >
                  <Upload className="w-4 h-4" />
                  Import Data
                </motion.button>
              </div>
            </GlassCard>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

// Add missing icon
const Clock = ({ className }: { className: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

export default function ControlPage() {
  const [currentCanvas, setCurrentCanvas] = useState(0);

  const canvases = [
    {
      label: "Dashboard KPI",
      component: <DashboardKPICanvas />,
    },
    {
      label: "Score & Analytics",
      component: <ScoreAnalyticsCanvas />,
    },
    {
      label: "Sistema",
      component: <SystemCanvas />,
    },
  ];

  const quickActions = [
    {
      label: "System Health",
      icon: Activity,
      action: () => console.log("System health"),
    },
    {
      label: "Export Data",
      icon: Download,
      action: () => console.log("Export"),
    },
    {
      label: "Settings",
      icon: Settings,
      action: () => console.log("Settings"),
    },
  ];

  return (
    <div className="w-full h-screen bg-black flex flex-col relative">
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-green-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />
      </div>

      {/* Carousel */}
      <div className="flex-1 relative z-10">
        <CarouselEngine
          currentIndex={currentCanvas}
          onIndexChange={setCurrentCanvas}
          labels={canvases.map(c => c.label)}
        >
          {canvases.map((canvas, idx) => (
            <div key={idx}>{canvas.component}</div>
          ))}
        </CarouselEngine>
      </div>

      {/* AI Companion */}
      <AICompanion context="control" quickActions={quickActions} />
    </div>
  );
}

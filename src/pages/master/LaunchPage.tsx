import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CarouselEngine,
  GlassCard,
} from "@/components/platform";
import {
  Users,
  Mail,
  Linkedin,
  MessageCircle,
  Target,
  Zap,
  Calendar,
  Clock,
  TrendingUp,
  Send,
  Sparkles,
  ChevronRight,
  Copy,
  RefreshCw,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface TemplateVariant {
  id: string;
  tone: string;
  preview: string;
  language: string;
}

interface JobItem {
  id: string;
  name: string;
  status: "pending" | "running" | "completed" | "failed";
  progress: number;
  sent: number;
  total: number;
  source: string;
}

// Mock campaign data
const CAMPAIGN_STEPS = [
  { id: "audience", label: "Seleziona Audience", description: "Definisci il target della campagna" },
  { id: "channel", label: "Scegli Canale", description: "Email, LinkedIn, WhatsApp" },
  { id: "goal", label: "Imposta Obiettivo", description: "Scrivi il goal della campagna" },
];

const CHANNEL_OPTIONS = [
  { id: "email", label: "Email", icon: Mail, color: "blue" },
  { id: "linkedin", label: "LinkedIn", icon: Linkedin, color: "blue" },
  { id: "whatsapp", label: "WhatsApp", icon: MessageCircle, color: "green" },
];

const TONE_OPTIONS = [
  { id: "professional", label: "Professionale", emoji: "🎯" },
  { id: "friendly", label: "Amichevole", emoji: "👋" },
  { id: "urgent", label: "Urgente", emoji: "⚡" },
  { id: "creative", label: "Creativo", emoji: "✨" },
];

const CTA_OPTIONS = [
  { id: "booking", label: "Prenota Riunione", emoji: "📅" },
  { id: "demo", label: "Richiedi Demo", emoji: "🎬" },
  { id: "contact", label: "Contattami", emoji: "💬" },
  { id: "download", label: "Scarica Risorsa", emoji: "📥" },
];

const TEMPLATE_VARIABLES = [
  { name: "{nome}", color: "blue" },
  { name: "{azienda}", color: "purple" },
  { name: "{paese}", color: "green" },
  { name: "{settore}", color: "orange" },
];

// Canvas 1: Crea Campagna
function CreaCampagnaCanvas() {
  const [step, setStep] = useState(0);
  const [campaignData, setCampaignData] = useState({
    audience: "circuit-stage",
    selectedCount: 87,
    channel: "email",
    goal: "",
    strategy: "",
  });

  const audienceOptions = [
    { label: "Da Filtri Globali", value: "filters", contacts: 45 },
    { label: "Da Stage Circuit", value: "circuit-stage", contacts: 87 },
    { label: "Selezione Manuale", value: "manual", contacts: 0 },
  ];

  const strategyOptions = [
    { label: "Lead Generation", value: "leads", description: "Raccogli nuovi lead" },
    { label: "Nurturing", value: "nurturing", description: "Coltiva relazioni esistenti" },
    { label: "Sales Outreach", value: "sales", description: "Chiudi deals attivi" },
    { label: "Retention", value: "retention", description: "Mantieni clienti esistenti" },
  ];

  const selectedChannel = CHANNEL_OPTIONS.find(c => c.id === campaignData.channel);
  const selectedAudience = audienceOptions.find(a => a.value === campaignData.audience);

  return (
    <div className="w-full h-full p-6 flex flex-col gap-6 overflow-hidden">
      <div>
        <h2 className="text-2xl font-bold text-white mb-1">Crea Campagna</h2>
        <p className="text-white/50 text-sm">Configura una nuova campagna di outreach</p>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6 overflow-hidden">
        {/* Left: Step selector and info */}
        <div className="flex flex-col gap-4 overflow-hidden">
          <GlassCard className="p-0 overflow-hidden">
            {/* Steps */}
            <div className="divide-y divide-white/5">
              {CAMPAIGN_STEPS.map((s, idx) => (
                <motion.button
                  key={s.id}
                  onClick={() => setStep(idx)}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.08, duration: 0.5, ease: [0.32, 0.72, 0, 1] }}
                  className={cn(
                    "w-full p-4 text-left transition-all hover:bg-white/5",
                    step === idx && "bg-white/10 border-l-2 border-blue-400"
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div className={cn(
                      "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold",
                      step === idx
                        ? "bg-blue-500/40 text-blue-200"
                        : "bg-white/10 text-white/60"
                    )}>
                      {idx + 1}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-white text-sm">{s.label}</p>
                      <p className="text-xs text-white/50">{s.description}</p>
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>
          </GlassCard>

          {/* Audience counter */}
          <GlassCard variant="highlighted" className="p-4">
            <div className="text-center">
              <p className="text-xs text-white/50 mb-2">CONTATTI SELEZIONATI</p>
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 20 }}
                className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 mb-2"
              >
                {campaignData.selectedCount}
              </motion.div>
              <p className="text-xs text-white/60">contatti pronti per la campagna</p>
            </div>
          </GlassCard>

          {/* Funnel preview */}
          <GlassCard className="p-4 flex-1 flex flex-col justify-center">
            <p className="text-xs text-white/50 mb-4">Funnel Preview</p>
            <div className="space-y-3">
              {[
                { label: "Sent", value: campaignData.selectedCount, color: "blue", bgClass: "bg-blue-500/20", textClass: "text-blue-300" },
                { label: "Opened", value: Math.round(campaignData.selectedCount * 0.35), color: "purple", bgClass: "bg-purple-500/20", textClass: "text-purple-300" },
                { label: "Clicked", value: Math.round(campaignData.selectedCount * 0.12), color: "orange", bgClass: "bg-orange-500/20", textClass: "text-orange-300" },
                { label: "Replied", value: Math.round(campaignData.selectedCount * 0.05), color: "green", bgClass: "bg-green-500/20", textClass: "text-green-300" },
              ].map((item, idx) => (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.08, duration: 0.5, ease: [0.32, 0.72, 0, 1] }}
                  className="flex items-center gap-3"
                >
                  <div className={cn(`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold`, item.bgClass, item.textClass)}>
                    {idx + 1}
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-white/60">{item.label}</p>
                    <div className="h-1 bg-white/10 rounded-full overflow-hidden mt-1">
                      <motion.div
                        className={item.color === "blue" ? "h-full bg-blue-500" : item.color === "purple" ? "h-full bg-purple-500" : item.color === "orange" ? "h-full bg-orange-500" : "h-full bg-green-500"}
                        initial={{ width: "0%" }}
                        animate={{ width: `${(item.value / campaignData.selectedCount) * 100}%` }}
                        transition={{ duration: 0.8, delay: 0.3 }}
                      />
                    </div>
                  </div>
                  <span className="text-xs font-semibold text-white/70 w-8 text-right">{item.value}</span>
                </motion.div>
              ))}
            </div>
          </GlassCard>
        </div>

        {/* Right: Step content */}
        <div className="flex flex-col gap-4 overflow-hidden">
          <AnimatePresence mode="wait">
            {step === 0 && (
              <motion.div
                key="audience"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex-1 flex flex-col gap-4 overflow-hidden"
              >
                <GlassCard className="p-0 overflow-hidden">
                  {audienceOptions.map((option, idx) => (
                    <motion.button
                      key={option.value}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.08, duration: 0.5, ease: [0.32, 0.72, 0, 1] }}
                      onClick={() => setCampaignData({ ...campaignData, audience: option.value, selectedCount: option.contacts })}
                      className={cn(
                        "w-full p-4 text-left border-b border-white/5 transition-all hover:bg-white/5",
                        campaignData.audience === option.value && "bg-white/10 border-l-2 border-blue-400"
                      )}
                    >
                      <p className="font-medium text-white">{option.label}</p>
                      <p className="text-sm text-white/60 mt-1">{option.contacts} contatti</p>
                    </motion.button>
                  ))}
                </GlassCard>
              </motion.div>
            )}

            {step === 1 && (
              <motion.div
                key="channel"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex-1 flex flex-col gap-4 overflow-hidden"
              >
                <div className="grid grid-cols-1 gap-3">
                  {CHANNEL_OPTIONS.map((channel, idx) => {
                    const Icon = channel.icon;
                    return (
                      <motion.button
                        key={channel.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.08, duration: 0.5, ease: [0.32, 0.72, 0, 1] }}
                        onClick={() => setCampaignData({ ...campaignData, channel: channel.id })}
                        className={cn(
                          "p-4 rounded-xl border-2 transition-all flex items-center gap-3",
                          campaignData.channel === channel.id
                            ? "border-blue-400/50 bg-white/10"
                            : "border-white/10 bg-white/5 hover:border-white/20"
                        )}
                      >
                        <Icon className="w-6 h-6 text-white" />
                        <div className="text-left flex-1">
                          <p className="font-semibold text-white">{channel.label}</p>
                          <p className="text-xs text-white/60">Invia via {channel.label}</p>
                        </div>
                        {campaignData.channel === channel.id && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="w-5 h-5 rounded-full bg-blue-400 flex items-center justify-center"
                          >
                            <div className="w-2 h-2 rounded-full bg-white" />
                          </motion.div>
                        )}
                      </motion.button>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="goal"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex-1 flex flex-col gap-4 overflow-hidden"
              >
                <GlassCard className="p-0 overflow-hidden">
                  {strategyOptions.map((strategy, idx) => (
                    <motion.button
                      key={strategy.value}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.08, duration: 0.5, ease: [0.32, 0.72, 0, 1] }}
                      onClick={() => setCampaignData({ ...campaignData, strategy: strategy.value })}
                      className={cn(
                        "w-full p-4 text-left border-b border-white/5 transition-all hover:bg-white/5",
                        campaignData.strategy === strategy.value && "bg-white/10 border-l-2 border-blue-400"
                      )}
                    >
                      <p className="font-medium text-white">{strategy.label}</p>
                      <p className="text-sm text-white/60 mt-1">{strategy.description}</p>
                    </motion.button>
                  ))}
                </GlassCard>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex gap-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              onClick={() => setStep(Math.max(0, step - 1))}
              disabled={step === 0}
              className="flex-1 px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white/60 disabled:opacity-50 hover:bg-white/10 transition-all"
            >
              Indietro
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              onClick={() => setStep(Math.min(CAMPAIGN_STEPS.length - 1, step + 1))}
              disabled={step === CAMPAIGN_STEPS.length - 1}
              className="flex-1 px-4 py-2 rounded-lg bg-gradient-to-r from-blue-500/30 to-purple-500/30 border border-blue-400/50 text-white hover:from-blue-500/40 hover:to-purple-500/40 transition-all"
            >
              Avanti
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Canvas 2: Template AI
function TemplateAICanvas() {
  const [selectedTone, setSelectedTone] = useState("professional");
  const [selectedCTA, setSelectedCTA] = useState("booking");
  const [isGenerating, setIsGenerating] = useState(false);
  const [showPreview, setShowPreview] = useState(true);

  const templates: Record<string, TemplateVariant> = {
    professional: {
      id: "prof1",
      tone: "Professionale",
      language: "Italiano",
      preview: "Buongiorno {nome},\n\nHo notato che {azienda} opera nel settore {settore} in {paese}. Con la nostra soluzione di freight logistics, abbiamo aiutato aziende simili a ridurre i costi di spedizione del 35%...",
    },
    friendly: {
      id: "friendly1",
      tone: "Amichevole",
      language: "Italiano",
      preview: "Ciao {nome}! 👋\n\nSono sempre alla ricerca di colleghi innovativi come quelli di {azienda}. Penso che potremmo creare qualcosa di straordinario insieme nel mercato {paese}...",
    },
    urgent: {
      id: "urgent1",
      tone: "Urgente",
      language: "Italiano",
      preview: "Attenz {nome}! ⚡\n\n{azienda} sta probabilmente perdendo denaro sui costi di spedizione. Abbiamo una soluzione che potrebbe salvarvi migliaia di euro al mese. Disponibile solo per {paese} fino a fine mese...",
    },
    creative: {
      id: "creative1",
      tone: "Creativo",
      language: "Italiano",
      preview: "Ehi {nome}! ✨\n\nImmagina questo: {azienda} riduce i tempi di consegna del 50% e i clienti si innamorano. Il segreto? Un sistema di freight logistics intelligente come il nostro, perfetto per {paese}...",
    },
  };

  const currentTemplate = templates[selectedTone];

  const handleGenerate = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
    }, 1500);
  };

  return (
    <div className="w-full h-full p-6 flex flex-col gap-6 overflow-hidden">
      <div>
        <h2 className="text-2xl font-bold text-white mb-1">Template AI</h2>
        <p className="text-white/50 text-sm">Crea template di messaggi personalizzati con AI</p>
      </div>

      <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 overflow-hidden">
        {/* Left: Template editor */}
        <div className="flex flex-col gap-4 overflow-hidden">
          <GlassCard className="flex-1 p-4 flex flex-col overflow-hidden">
            <p className="text-xs text-white/50 uppercase tracking-wide mb-3">Template Preview</p>
            <div className="flex-1 relative">
              {isGenerating && (
                <div className="absolute inset-0 bg-white/5 border border-white/10 rounded-lg flex items-center justify-center z-10 backdrop-blur-sm">
                  <div className="flex flex-col items-center gap-3">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, repeat: Infinity, linear: true }}
                      className="w-8 h-8 border-2 border-white/20 border-t-blue-400 rounded-full"
                    />
                    <p className="text-xs text-white/60">Generando...</p>
                  </div>
                </div>
              )}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                key={selectedTone}
                className="p-4 rounded-lg bg-white/5 border border-white/10 text-sm text-white/80 leading-relaxed h-full overflow-y-auto"
              >
                {currentTemplate.preview}
              </motion.div>
            </div>

            {/* Variables */}
            <div className="mt-4 pt-4 border-t border-white/5">
              <p className="text-xs text-white/50 mb-2">Variabili utilizzate:</p>
              <div className="flex flex-wrap gap-2">
                {TEMPLATE_VARIABLES.map((v) => {
                  const colorClasses = {
                    blue: "bg-blue-500/20 border-blue-500/30",
                    purple: "bg-purple-500/20 border-purple-500/30",
                    green: "bg-green-500/20 border-green-500/30",
                    orange: "bg-orange-500/20 border-orange-500/30",
                  };
                  return (
                    <motion.div
                      key={v.name}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className={cn(`px-2 py-1 rounded text-xs font-mono text-white/80 border`, colorClasses[v.color as keyof typeof colorClasses])}
                    >
                      {v.name}
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </GlassCard>
        </div>

        {/* Center: AI Controls */}
        <div className="flex flex-col gap-4 overflow-y-auto">
          <GlassCard className="p-4">
            <h3 className="text-sm font-semibold text-white mb-3">Tone</h3>
            <div className="space-y-2">
              {TONE_OPTIONS.map((tone) => (
                <motion.button
                  key={tone.id}
                  whileHover={{ scale: 1.02 }}
                  onClick={() => setSelectedTone(tone.id)}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all text-sm",
                    selectedTone === tone.id
                      ? "bg-white/20 border border-white/30 text-white"
                      : "bg-white/5 border border-white/10 text-white/70 hover:border-white/20"
                  )}
                >
                  <span className="text-lg">{tone.emoji}</span>
                  <span>{tone.label}</span>
                </motion.button>
              ))}
            </div>
          </GlassCard>

          <GlassCard className="p-4">
            <h3 className="text-sm font-semibold text-white mb-3">Call-to-Action</h3>
            <div className="space-y-2">
              {CTA_OPTIONS.map((cta) => (
                <motion.button
                  key={cta.id}
                  whileHover={{ scale: 1.02 }}
                  onClick={() => setSelectedCTA(cta.id)}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all text-sm",
                    selectedCTA === cta.id
                      ? "bg-white/20 border border-white/30 text-white"
                      : "bg-white/5 border border-white/10 text-white/70 hover:border-white/20"
                  )}
                >
                  <span className="text-lg">{cta.emoji}</span>
                  <span>{cta.label}</span>
                </motion.button>
              ))}
            </div>
          </GlassCard>

          <GlassCard className="p-4">
            <h3 className="text-sm font-semibold text-white mb-3">Lingua</h3>
            <button className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white text-sm hover:border-white/40 transition-colors">
              🇮🇹 Italiano
            </button>
          </GlassCard>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleGenerate}
            className="w-full px-4 py-3 rounded-lg bg-gradient-to-r from-blue-500/30 to-purple-500/30 border border-blue-400/50 text-white font-medium hover:from-blue-500/40 hover:to-purple-500/40 transition-all flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            Genera con AI
          </motion.button>
        </div>

        {/* Right: Preview & Variants */}
        <div className="flex flex-col gap-4 overflow-hidden">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white">Preview Contact</h3>
            <motion.button
              whileHover={{ rotate: 180 }}
              onClick={() => setShowPreview(!showPreview)}
              className="p-2 rounded-lg bg-white/10 border border-white/20 text-white/60 hover:border-white/40 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
            </motion.button>
          </div>

          <GlassCard className="flex-1 p-4 flex flex-col overflow-hidden">
            <div className="space-y-2 mb-4 pb-4 border-b border-white/5">
              <p className="text-xs text-white/50">A:</p>
              <p className="text-white font-medium">Marco Rossi</p>
              <p className="text-sm text-white/60">Logistica Italia - Italia</p>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3">
              {[
                "Buongiorno Marco,",
                "Ho notato che Logistica Italia opera nel settore della logistica in Italia. Con la nostra soluzione di freight logistics, abbiamo aiutato aziende simili a ridurre i costi di spedizione del 35%.",
                "Sarei felice di mostrarvi come funziona. Disponibile per una chiamata questa settimana?",
                "Cordiali saluti"
              ].map((line, idx) => (
                <motion.p
                  key={idx}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.08, duration: 0.5, ease: [0.32, 0.72, 0, 1] }}
                  className="text-sm text-white/80 leading-relaxed"
                >
                  {line}
                </motion.p>
              ))}
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white/80 hover:border-white/40 transition-colors text-sm"
            >
              <Copy className="w-4 h-4" />
              Copia
            </motion.button>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}

// Canvas 3: Programma & Monitora
function ProgrammaMonitoraCanvas() {
  const [jobs] = useState<JobItem[]>([
    { id: "1", name: "Campaign Q1 - Wave 1", status: "running", progress: 65, sent: 45, total: 87, source: "Manual" },
    { id: "2", name: "LinkedIn Outreach", status: "completed", progress: 100, sent: 156, total: 156, source: "LinkedIn" },
    { id: "3", name: "Email Nurture - Cold", status: "pending", progress: 0, sent: 0, total: 234, source: "Email" },
    { id: "4", name: "WhatsApp Follow-up", status: "failed", progress: 30, sent: 8, total: 25, source: "WhatsApp" },
  ]);

  const stats = [
    { label: "Sent", value: 209, icon: Send, color: "blue" },
    { label: "Opened", value: 73, icon: Mail, color: "purple" },
    { label: "Replied", value: 12, icon: MessageCircle, color: "green" },
    { label: "Bounced", value: 4, icon: TrendingUp, color: "red" },
  ];

  const statusConfig = {
    pending: { bg: "bg-yellow-500/20", border: "border-yellow-500/30", dot: "bg-yellow-500" },
    running: { bg: "bg-blue-500/20", border: "border-blue-500/30", dot: "bg-blue-500" },
    completed: { bg: "bg-green-500/20", border: "border-green-500/30", dot: "bg-green-500" },
    failed: { bg: "bg-red-500/20", border: "border-red-500/30", dot: "bg-red-500" },
  };

  return (
    <div className="w-full h-full p-6 flex flex-col gap-6 overflow-hidden">
      <div>
        <h2 className="text-2xl font-bold text-white mb-1">Programma & Monitora</h2>
        <p className="text-white/50 text-sm">Calendario, job queue, e statistiche in tempo reale</p>
      </div>

      <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 overflow-hidden">
        {/* Stats cards */}
        <div className="col-span-1 flex flex-col gap-3">
          {stats.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
              >
                <GlassCard className="p-3">
                  <div className="flex items-start justify-between mb-2">
                    <Icon className="w-5 h-5 text-white/60" />
                    <p className="text-xs text-white/50">{stat.label}</p>
                  </div>
                  <motion.div
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 150 }}
                    className="text-2xl font-bold text-white"
                  >
                    {stat.value}
                  </motion.div>
                </GlassCard>
              </motion.div>
            );
          })}
        </div>

        {/* Calendar grid - simplified */}
        <div className="col-span-2 flex flex-col gap-3">
          <p className="text-xs text-white/50 uppercase tracking-wide">Scheduled Sends</p>
          <GlassCard className="flex-1 p-4 overflow-hidden">
            <div className="grid grid-cols-7 gap-2 h-full">
              {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day, idx) => (
                <motion.div
                  key={day}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="flex flex-col gap-2"
                >
                  <p className="text-xs text-white/50 text-center font-medium">{day}</p>
                  {[...Array(4)].map((_, i) => (
                    <motion.div
                      key={i}
                      whileHover={{ scale: 1.1 }}
                      className={cn(
                        "aspect-square rounded-lg cursor-pointer transition-all",
                        Math.random() > 0.5 ? "bg-blue-500/30 border border-blue-500/50" : "bg-white/5 border border-white/10 hover:border-white/20"
                      )}
                    />
                  ))}
                </motion.div>
              ))}
            </div>
          </GlassCard>
        </div>

        {/* Job controls */}
        <div className="col-span-1 flex flex-col gap-3">
          <p className="text-xs text-white/50 uppercase tracking-wide">Controls</p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            className="w-full px-3 py-2 rounded-lg bg-green-500/20 border border-green-500/50 text-green-300 text-sm font-medium hover:border-green-500/70 transition-all flex items-center justify-center gap-2"
          >
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-2 h-2 rounded-full bg-green-500"
            />
            Start All
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            className="w-full px-3 py-2 rounded-lg bg-yellow-500/20 border border-yellow-500/50 text-yellow-300 text-sm font-medium hover:border-yellow-500/70 transition-all"
          >
            Pause All
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            className="w-full px-3 py-2 rounded-lg bg-red-500/20 border border-red-500/50 text-red-300 text-sm font-medium hover:border-red-500/70 transition-all"
          >
            Stop All
          </motion.button>
        </div>
      </div>

      {/* Job queue */}
      <div className="h-40 overflow-hidden">
        <p className="text-xs text-white/50 uppercase tracking-wide mb-3">Job Queue</p>
        <GlassCard className="h-full p-0 overflow-y-auto">
          <div className="divide-y divide-white/5">
            {jobs.map((job, idx) => {
              const config = statusConfig[job.status];
              return (
                <motion.div
                  key={job.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className={cn("p-3 flex items-center gap-3", config.bg, config.border)}
                >
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className={cn("w-2 h-2 rounded-full flex-shrink-0", config.dot)}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{job.name}</p>
                    <div className="flex gap-2 text-xs text-white/60 mt-1">
                      <span>{job.sent}/{job.total} sent</span>
                      <span>•</span>
                      <span>{job.source}</span>
                    </div>
                    <div className="h-1 bg-white/10 rounded-full overflow-hidden mt-2">
                      <motion.div
                        className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
                        initial={{ width: "0%" }}
                        animate={{ width: `${job.progress}%` }}
                        transition={{ duration: 1 }}
                      />
                    </div>
                  </div>
                  <span className="text-xs font-semibold text-white/70 flex-shrink-0">{job.progress}%</span>
                </motion.div>
              );
            })}
          </div>
        </GlassCard>
      </div>
    </div>
  );
}

export default function LaunchPage() {
  const [currentCanvas, setCurrentCanvas] = useState(0);

  const canvases = [
    {
      label: "Crea Campagna",
      component: <CreaCampagnaCanvas />,
    },
    {
      label: "Template AI",
      component: <TemplateAICanvas />,
    },
    {
      label: "Programma & Monitora",
      component: <ProgrammaMonitoraCanvas />,
    },
  ];

  const quickActions = [
    {
      label: "Quick Campaign",
      icon: Zap,
      action: () => console.log("Quick campaign"),
    },
    {
      label: "AI Template",
      icon: Sparkles,
      action: () => console.log("AI template"),
    },
    {
      label: "Schedule Send",
      icon: Calendar,
      action: () => console.log("Schedule"),
    },
  ];

  return (
    <div className="w-full h-full bg-black flex flex-col relative">
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/3 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/3 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl" />
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
    </div>
  );
}

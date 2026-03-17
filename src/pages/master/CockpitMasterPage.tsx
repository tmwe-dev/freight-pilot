import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CarouselEngine,
  GlassCard,
  AICompanion,
} from "@/components/platform";
import {
  Mail,
  Building2,
  Linkedin,
  Phone,
  TrendingUp,
  CreditCard,
  Scale,
  Anchor,
  Globe,
  ShoppingCart,
  Send,
  FileText,
  MessageSquare,
  ChevronRight,
  Trash2,
  Tag,
  Archive,
  Download,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Contact {
  id: string;
  name: string;
  company: string;
  stage: "nuovo" | "contattato" | "lavorazione" | "negoziazione" | "convertito" | "perso";
  daysInStage: number;
  score: number;
  email?: string;
  phone?: string;
  linkedin?: string;
  lastAction?: string;
}

interface ContactAction {
  id: string;
  type: string;
  timestamp: string;
  description: string;
}

// Mock data
const MOCK_CONTACTS: Contact[] = [
  { id: "1", name: "Marco Rossi", company: "Logistica Italia", stage: "nuovo", daysInStage: 2, score: 85, email: "marco@logistica.it", phone: "+39 02 1234 5678", linkedin: "marco-rossi" },
  { id: "2", name: "Anna Ferrari", company: "TransportCo", stage: "nuovo", daysInStage: 5, score: 72, email: "anna@transportco.it", phone: "+39 03 1234 5678" },
  { id: "3", name: "Luca Bianchi", company: "Cargo Express", stage: "contattato", daysInStage: 8, score: 78, email: "luca@cargoexpress.it" },
  { id: "4", name: "Sofia Gallo", company: "ShipFast", stage: "contattato", daysInStage: 3, score: 92, email: "sofia@shipfast.it" },
  { id: "5", name: "Carlo Rizzo", company: "Ocean Logistics", stage: "contattato", daysInStage: 12, score: 65, email: "carlo@oceanlog.it" },
  { id: "6", name: "Elena Moretti", company: "Freight Solutions", stage: "lavorazione", daysInStage: 6, score: 88, email: "elena@freightsol.it" },
  { id: "7", name: "Paolo Sala", company: "Global Moves", stage: "lavorazione", daysInStage: 4, score: 81, email: "paolo@globalmoves.it" },
  { id: "8", name: "Giulia Martini", company: "Express Route", stage: "lavorazione", daysInStage: 10, score: 76, email: "giulia@expressroute.it" },
  { id: "9", name: "Roberto Conti", company: "Port Authority", stage: "negoziazione", daysInStage: 7, score: 90, email: "roberto@port.it" },
  { id: "10", name: "Francesca Lini", company: "Premium Shipping", stage: "negoziazione", daysInStage: 5, score: 87, email: "francesca@premiumship.it" },
  { id: "11", name: "Davide Neri", company: "Trade Hub", stage: "convertito", daysInStage: 2, score: 95, email: "davide@tradehub.it" },
  { id: "12", name: "Valentina Rosa", company: "Customs Plus", stage: "convertito", daysInStage: 1, score: 98, email: "valentina@customsplus.it" },
  { id: "13", name: "Lorenzo Blu", company: "Sea Routes", stage: "perso", daysInStage: 30, score: 35, email: "lorenzo@searoutes.it" },
  { id: "14", name: "Chiara Verdi", company: "Cargo Park", stage: "nuovo", daysInStage: 1, score: 68, email: "chiara@cargopark.it" },
  { id: "15", name: "Matteo Gialli", company: "Logistics Plus", stage: "contattato", daysInStage: 15, score: 58, email: "matteo@logisticplus.it" },
];

const STAGE_CONFIG = {
  nuovo: { color: "blue", label: "Nuovo", order: 0 },
  contattato: { color: "yellow", label: "Contattato", order: 1 },
  lavorazione: { color: "orange", label: "In Lavorazione", order: 2 },
  negoziazione: { color: "purple", label: "Negoziazione", order: 3 },
  convertito: { color: "green", label: "Convertito", order: 4 },
  perso: { color: "red", label: "Perso", order: 5 },
};

const COLOR_MAP = {
  blue: "from-blue-500/20 to-blue-500/10 border-blue-500/30",
  yellow: "from-yellow-500/20 to-yellow-500/10 border-yellow-500/30",
  orange: "from-orange-500/20 to-orange-500/10 border-orange-500/30",
  purple: "from-purple-500/20 to-purple-500/10 border-purple-500/30",
  green: "from-green-500/20 to-green-500/10 border-green-500/30",
  red: "from-red-500/20 to-red-500/10 border-red-500/30",
};

// Canvas 1: Circuito di Attesa (Kanban)
function CircuitoCanvas({ contacts, onContactUpdate }: { contacts: Contact[]; onContactUpdate: (contact: Contact) => void }) {
  const [draggedContact, setDraggedContact] = useState<Contact | null>(null);
  const [hoveredStage, setHoveredStage] = useState<string | null>(null);

  const stages = ["nuovo", "contattato", "lavorazione", "negoziazione", "convertito", "perso"] as const;
  const contactsByStage = useMemo(() => {
    const grouped: Record<string, Contact[]> = {};
    stages.forEach(s => grouped[s] = []);
    contacts.forEach(c => {
      if (c.stage in grouped) grouped[c.stage].push(c);
    });
    return grouped;
  }, [contacts]);

  const handleDragEnd = (contact: Contact, targetStage: string) => {
    if (Object.keys(STAGE_CONFIG).includes(targetStage)) {
      onContactUpdate({ ...contact, stage: targetStage as any });
    }
    setDraggedContact(null);
    setHoveredStage(null);
  };

  return (
    <div className="w-full h-full p-6 flex flex-col gap-6 overflow-hidden">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-white mb-1">Circuito di Attesa</h2>
        <p className="text-white/50 text-sm">Trascina i contatti tra gli stage per aggiornare il loro stato</p>
      </div>

      {/* Kanban board */}
      <div className="flex-1 flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
        {stages.map((stage) => {
          const config = STAGE_CONFIG[stage];
          const stageContacts = contactsByStage[stage] || [];
          const isHovered = hoveredStage === stage;

          return (
            <motion.div
              key={stage}
              className={cn(
                "flex-shrink-0 w-80 rounded-xl border transition-all duration-300",
                "bg-white/[0.02] backdrop-blur-xl",
                isHovered ? "border-white/30 shadow-lg" : "border-white/10"
              )}
              animate={{ scale: isHovered ? 1.02 : 1 }}
            >
              {/* Column header */}
              <div
                className={cn(
                  "px-4 py-3 border-b border-white/10 bg-gradient-to-r",
                  COLOR_MAP[config.color as keyof typeof COLOR_MAP]
                )}
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-white">{config.label}</h3>
                  <span className="px-2 py-1 rounded-full bg-white/10 text-xs text-white/80">
                    {stageContacts.length}
                  </span>
                </div>
              </div>

              {/* Cards container */}
              <div
                className="p-3 space-y-3 overflow-y-auto max-h-96"
                onDragOver={() => setHoveredStage(stage)}
                onDragLeave={() => setHoveredStage(null)}
                onDrop={() => draggedContact && handleDragEnd(draggedContact, stage)}
              >
                <AnimatePresence>
                  {stageContacts.map((contact, idx) => (
                    <motion.div
                      key={contact.id}
                      draggable
                      onDragStart={() => setDraggedContact(contact)}
                      onDragEnd={() => setDraggedContact(null)}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ delay: idx * 0.05 }}
                      className={cn(
                        "p-3 rounded-lg cursor-move transition-all duration-200",
                        "bg-white/5 border border-white/10 hover:border-white/20",
                        draggedContact?.id === contact.id && "opacity-50 shadow-lg shadow-white/20"
                      )}
                      whileHover={{ scale: 1.05, y: -2 }}
                    >
                      {/* Glow effect when dragged */}
                      {draggedContact?.id === contact.id && (
                        <motion.div
                          className="absolute inset-0 rounded-lg border border-white/50 blur-md"
                          animate={{ opacity: [0.3, 0.6, 0.3] }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                        />
                      )}

                      <div className="relative z-10 space-y-2">
                        <div>
                          <p className="font-semibold text-white text-sm">{contact.name}</p>
                          <p className="text-xs text-white/60">{contact.company}</p>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-white/50">{contact.daysInStage} days</span>
                          <div className="flex items-center gap-1">
                            <div className="w-16 h-1 bg-white/10 rounded-full overflow-hidden">
                              <motion.div
                                className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
                                initial={{ width: "0%" }}
                                animate={{ width: `${contact.score}%` }}
                                transition={{ duration: 0.6, delay: 0.2 }}
                              />
                            </div>
                            <span className="text-xs font-semibold text-white/80">{contact.score}</span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>

                {stageContacts.length === 0 && (
                  <div className="h-24 flex items-center justify-center text-white/30 text-xs text-center">
                    <p>Nessun contatto</p>
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

// Canvas 2: Lavorazione (Deep Search + AI Actions)
function LavorazioneCanvas({ contacts }: { contacts: Contact[] }) {
  const [selectedContact, setSelectedContact] = useState<Contact>(contacts[0]);
  const [advancedOpen, setAdvancedOpen] = useState(false);

  const defaultActions = [
    { label: "Email Lookup", icon: Mail, color: "blue" },
    { label: "Company Info", icon: Building2, color: "purple" },
    { label: "LinkedIn", icon: Linkedin, color: "blue" },
    { label: "Phone", icon: Phone, color: "green" },
    { label: "Revenue Data", icon: TrendingUp, color: "yellow" },
  ];

  const advancedActions = [
    { label: "Credit Check", icon: CreditCard, color: "red" },
    { label: "Legal History", icon: Scale, color: "orange" },
    { label: "Port Data", icon: Anchor, color: "blue" },
    { label: "Trade Routes", icon: Globe, color: "purple" },
    { label: "Customs Data", icon: ShoppingCart, color: "green" },
  ];

  const aiActions = [
    { label: "Genera Email", icon: Mail },
    { label: "Crea Proposta", icon: FileText },
    { label: "Scrivi Messaggio", icon: MessageSquare },
    { label: "Prepara Report", icon: TrendingUp },
  ];

  return (
    <div className="w-full h-full p-6 flex flex-col gap-6 overflow-hidden">
      <div>
        <h2 className="text-2xl font-bold text-white mb-1">Lavorazione</h2>
        <p className="text-white/50 text-sm">Ricerche approfondite e azioni AI per il contatto selezionato</p>
      </div>

      <div className="flex-1 grid grid-cols-3 gap-4 overflow-hidden">
        {/* Left: Contact List */}
        <div className="flex flex-col gap-4 overflow-hidden">
          <GlassCard className="flex-1 overflow-y-auto p-0">
            <div className="divide-y divide-white/5">
              {contacts.slice(0, 8).map((contact, idx) => (
                <motion.div
                  key={contact.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  onClick={() => setSelectedContact(contact)}
                  className={cn(
                    "p-3 cursor-pointer transition-all",
                    selectedContact.id === contact.id
                      ? "bg-white/10 border-l-2 border-blue-400"
                      : "hover:bg-white/5"
                  )}
                >
                  <p className="font-medium text-sm text-white">{contact.name}</p>
                  <p className="text-xs text-white/50">{contact.company}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="px-2 py-0.5 rounded text-xs bg-white/5 text-white/70">
                      {STAGE_CONFIG[contact.stage].label}
                    </span>
                    <span className="text-xs text-white/60">{contact.score}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </GlassCard>
        </div>

        {/* Center: Deep Search Actions + Contact Details */}
        <div className="flex flex-col gap-4 overflow-hidden">
          {/* Deep Search */}
          <GlassCard className="p-4 flex flex-col gap-3">
            <h3 className="text-sm font-semibold text-white">Deep Search</h3>
            <div className="space-y-2">
              {defaultActions.map((action, idx) => {
                const Icon = action.icon;
                return (
                  <motion.button
                    key={idx}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    whileHover={{ x: 4 }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all text-sm text-white/80"
                  >
                    <Icon className="w-4 h-4" />
                    <span>{action.label}</span>
                    <ChevronRight className="w-3 h-3 ml-auto" />
                  </motion.button>
                );
              })}
            </div>

            {/* Advanced toggle */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              onClick={() => setAdvancedOpen(!advancedOpen)}
              className="text-xs text-white/60 hover:text-white/80 transition-colors text-left py-2"
            >
              {advancedOpen ? "- Nascondi" : "+ Mostra"} ricerche avanzate
            </motion.button>

            {advancedOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-2 pt-2 border-t border-white/5"
              >
                {advancedActions.map((action, idx) => {
                  const Icon = action.icon;
                  return (
                    <motion.button
                      key={idx}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      whileHover={{ x: 4 }}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all text-sm text-white/80"
                    >
                      <Icon className="w-4 h-4" />
                      <span>{action.label}</span>
                      <ChevronRight className="w-3 h-3 ml-auto" />
                    </motion.button>
                  );
                })}
              </motion.div>
            )}
          </GlassCard>

          {/* Contact Details */}
          <GlassCard className="flex-1 p-4 overflow-y-auto">
            <div className="space-y-4">
              <div>
                <p className="text-xs text-white/50 uppercase tracking-wide mb-2">Contatto</p>
                <h3 className="text-lg font-bold text-white">{selectedContact.name}</h3>
                <p className="text-sm text-white/70">{selectedContact.company}</p>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <p className="text-white/50 mb-1">Email</p>
                  <p className="text-white/80">{selectedContact.email || "N/A"}</p>
                </div>
                <div>
                  <p className="text-white/50 mb-1">Phone</p>
                  <p className="text-white/80">{selectedContact.phone || "N/A"}</p>
                </div>
              </div>

              <div>
                <p className="text-white/50 mb-2 text-xs uppercase">Score</p>
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-green-500 to-blue-500"
                      initial={{ width: "0%" }}
                      animate={{ width: `${selectedContact.score}%` }}
                      transition={{ duration: 0.6 }}
                    />
                  </div>
                  <span className="text-white font-bold">{selectedContact.score}</span>
                </div>
              </div>
            </div>
          </GlassCard>
        </div>

        {/* Right: AI Actions Panel */}
        <div className="flex flex-col gap-4 overflow-hidden">
          <GlassCard className="flex-1 p-4 flex flex-col gap-3 overflow-y-auto">
            <h3 className="text-sm font-semibold text-white mb-2">Azioni AI</h3>
            {aiActions.map((action, idx) => {
              const Icon = action.icon;
              return (
                <motion.button
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.08 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg bg-gradient-to-r from-blue-500/10 to-purple-500/10 hover:from-blue-500/20 hover:to-purple-500/20 border border-blue-500/30 hover:border-blue-500/50 transition-all"
                >
                  <Icon className="w-4 h-4 text-white/80" />
                  <span className="text-sm text-white/80">{action.label}</span>
                </motion.button>
              );
            })}

            <div className="mt-auto pt-4 border-t border-white/5">
              <p className="text-xs text-white/50 mb-3">Anteprima ultimo output AI:</p>
              <GlassCard variant="default" className="p-3 text-xs text-white/70 leading-relaxed">
                <p>Caro Marco, based on your freight logistics expertise and recent market analysis, I've identified some key opportunities for partnership...</p>
              </GlassCard>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}

// Canvas 3: Azioni di Massa (Bulk Operations)
function AzioniMassaCanvas({ contacts }: { contacts: Contact[] }) {
  const [selected, setSelected] = useState<string[]>([]);
  const [showPreview, setShowPreview] = useState(false);

  const bulkActions = [
    { label: "Assign Tag", icon: Tag },
    { label: "Move Stage", icon: Archive },
    { label: "Send Campaign", icon: Send },
    { label: "Export", icon: Download },
    { label: "Delete", icon: Trash2 },
  ];

  const toggleSelect = (id: string) => {
    setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const toggleSelectAll = () => {
    if (selected.length === contacts.length) {
      setSelected([]);
    } else {
      setSelected(contacts.map(c => c.id));
    }
  };

  return (
    <div className="w-full h-full p-6 flex flex-col gap-4 overflow-hidden">
      <div>
        <h2 className="text-2xl font-bold text-white mb-1">Azioni di Massa</h2>
        <p className="text-white/50 text-sm">Esegui operazioni bulk su più contatti</p>
      </div>

      {/* Bulk toolbar */}
      <GlassCard className="p-4 flex items-center gap-4">
        <input
          type="checkbox"
          checked={selected.length === contacts.length && contacts.length > 0}
          onChange={toggleSelectAll}
          className="w-4 h-4 rounded border border-white/30 cursor-pointer"
        />
        <span className="text-sm text-white/60">{selected.length} selezionati</span>

        <div className="flex-1 flex gap-2 flex-wrap">
          {bulkActions.map((action, idx) => {
            const Icon = action.icon;
            return (
              <motion.button
                key={idx}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                disabled={selected.length === 0}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all",
                  selected.length > 0
                    ? "bg-white/10 border border-white/20 hover:border-white/40 text-white/80"
                    : "bg-white/5 border border-white/10 text-white/40 cursor-not-allowed"
                )}
              >
                <Icon className="w-4 h-4" />
                {action.label}
              </motion.button>
            );
          })}
        </div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          onClick={() => setShowPreview(!showPreview)}
          className="px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-sm text-white/80 hover:border-white/40 transition-colors"
        >
          {showPreview ? "Nascondi" : "Mostra"} Preview
        </motion.button>
      </GlassCard>

      {/* Preview panel */}
      <AnimatePresence>
        {showPreview && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <GlassCard className="p-4">
              <p className="text-xs text-white/50 mb-3">Email template per {selected.length} contatti:</p>
              <div className="p-3 rounded-lg bg-white/5 border border-white/10 text-sm text-white/80 leading-relaxed">
                <p className="font-semibold mb-2">Caro [nome],</p>
                <p>Ti contatto in relazione alle nostre soluzioni di freight logistics. Abbiamo aiutato centinaia di aziende a ottimizzare i loro processi di spedizione...</p>
              </div>
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Contacts table */}
      <GlassCard className="flex-1 overflow-auto">
        <div className="divide-y divide-white/5">
          {contacts.map((contact, idx) => (
            <motion.div
              key={contact.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.03 }}
              className={cn(
                "p-4 flex items-center gap-4 transition-colors hover:bg-white/5",
                selected.includes(contact.id) && "bg-white/10"
              )}
            >
              <input
                type="checkbox"
                checked={selected.includes(contact.id)}
                onChange={() => toggleSelect(contact.id)}
                className="w-4 h-4 rounded border border-white/30 cursor-pointer"
              />
              <div className="flex-1">
                <p className="font-medium text-white text-sm">{contact.name}</p>
                <p className="text-xs text-white/60">{contact.company}</p>
              </div>
              <span className="text-xs bg-white/5 px-2 py-1 rounded text-white/70">
                {STAGE_CONFIG[contact.stage].label}
              </span>
              <span className="text-sm font-semibold text-white w-12 text-right">{contact.score}</span>
            </motion.div>
          ))}
        </div>
      </GlassCard>
    </div>
  );
}

export default function CockpitMasterPage() {
  const [currentCanvas, setCurrentCanvas] = useState(0);
  const [contacts, setContacts] = useState<Contact[]>(MOCK_CONTACTS);

  const canvases = [
    {
      label: "Circuito di Attesa",
      component: <CircuitoCanvas contacts={contacts} onContactUpdate={(c) => setContacts(contacts.map(x => x.id === c.id ? c : x))} />,
    },
    {
      label: "Lavorazione",
      component: <LavorazioneCanvas contacts={contacts} />,
    },
    {
      label: "Azioni di Massa",
      component: <AzioniMassaCanvas contacts={contacts} />,
    },
  ];

  const quickActions = [
    {
      label: "Email Lookup",
      icon: Mail,
      action: () => console.log("Email Lookup"),
    },
    {
      label: "LinkedIn Search",
      icon: Linkedin,
      action: () => console.log("LinkedIn"),
    },
    {
      label: "Genera Email",
      icon: Send,
      action: () => console.log("Generate Email"),
    },
  ];

  return (
    <div className="w-full h-screen bg-black flex flex-col relative">
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
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
      <AICompanion context="cockpit" quickActions={quickActions} />
    </div>
  );
}

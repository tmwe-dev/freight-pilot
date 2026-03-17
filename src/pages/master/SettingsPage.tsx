import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  User, Shield, Bell, Globe, Key, Database, Palette, Wifi,
  ChevronRight, Check, Moon, Sun, Monitor, Zap, Mail, Lock,
  Server, HardDrive, RefreshCw, Download, Upload, Trash2,
  ToggleLeft, ToggleRight, ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SettingsSection {
  id: string;
  label: string;
  description: string;
  icon: any;
  gradient: string;
  glow: string;
  iconColor: string;
}

const SECTIONS: SettingsSection[] = [
  {
    id: "profile",
    label: "Profilo",
    description: "Account, email e dati personali",
    icon: User,
    gradient: "from-blue-500 to-cyan-400",
    glow: "rgba(59,130,246,0.3)",
    iconColor: "text-blue-400",
  },
  {
    id: "security",
    label: "Sicurezza",
    description: "Password, 2FA e sessioni",
    icon: Shield,
    gradient: "from-emerald-500 to-green-400",
    glow: "rgba(16,185,129,0.3)",
    iconColor: "text-emerald-400",
  },
  {
    id: "notifications",
    label: "Notifiche",
    description: "Email, push e avvisi",
    icon: Bell,
    gradient: "from-amber-500 to-yellow-400",
    glow: "rgba(245,158,11,0.3)",
    iconColor: "text-amber-400",
  },
  {
    id: "connections",
    label: "Connessioni",
    description: "WCA, API e integrazioni",
    icon: Wifi,
    gradient: "from-violet-500 to-purple-400",
    glow: "rgba(139,92,246,0.3)",
    iconColor: "text-violet-400",
  },
  {
    id: "api",
    label: "API Keys",
    description: "OpenAI, servizi esterni",
    icon: Key,
    gradient: "from-rose-500 to-pink-400",
    glow: "rgba(244,63,94,0.3)",
    iconColor: "text-rose-400",
  },
  {
    id: "data",
    label: "Dati",
    description: "Export, import e backup",
    icon: Database,
    gradient: "from-sky-500 to-blue-400",
    glow: "rgba(14,165,233,0.3)",
    iconColor: "text-sky-400",
  },
  {
    id: "appearance",
    label: "Aspetto",
    description: "Tema, lingua e display",
    icon: Palette,
    gradient: "from-fuchsia-500 to-pink-400",
    glow: "rgba(217,70,239,0.3)",
    iconColor: "text-fuchsia-400",
  },
  {
    id: "system",
    label: "Sistema",
    description: "Diagnostica e stato",
    icon: Server,
    gradient: "from-slate-400 to-zinc-400",
    glow: "rgba(148,163,184,0.25)",
    iconColor: "text-slate-400",
  },
];

function SettingRow({ icon: Icon, label, description, trailing, iconColor }: {
  icon: any; label: string; description?: string; trailing?: React.ReactNode; iconColor?: string;
}) {
  return (
    <div className="flex items-center gap-4 px-5 py-4 border-b border-white/[0.04] last:border-0 hover:bg-white/[0.02] transition-colors duration-200 group">
      <div className={cn("w-9 h-9 rounded-xl bg-white/[0.04] flex items-center justify-center flex-shrink-0", iconColor)}>
        <Icon className="w-4 h-4" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-white/90">{label}</div>
        {description && <div className="text-xs text-white/35 mt-0.5">{description}</div>}
      </div>
      {trailing || <ChevronRight className="w-4 h-4 text-white/20 group-hover:text-white/40 transition-colors" />}
    </div>
  );
}

function Toggle({ enabled, onChange }: { enabled: boolean; onChange: () => void }) {
  return (
    <button onClick={onChange} className="relative flex-shrink-0">
      <div className={cn(
        "w-10 h-5.5 rounded-full transition-colors duration-200",
        enabled ? "bg-blue-500/60" : "bg-white/10"
      )}>
        <motion.div
          className="absolute top-0.5 w-4.5 h-4.5 rounded-full bg-white shadow-sm"
          animate={{ left: enabled ? 20 : 2 }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
          style={{ width: 18, height: 18, top: 2 }}
        />
      </div>
    </button>
  );
}

function ProfilePanel() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-5 p-6">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-violet-500 flex items-center justify-center text-2xl font-bold text-white shadow-lg shadow-violet-500/20">
          LP
        </div>
        <div>
          <h3 className="text-lg font-semibold text-white">Luca Pilot</h3>
          <p className="text-sm text-white/40 mt-0.5">luca@tmwe.it</p>
          <p className="text-xs text-white/25 mt-1">Piano: Professional</p>
        </div>
      </div>
      <div className="border-t border-white/[0.04]">
        <SettingRow icon={Mail} label="Email" description="luca@tmwe.it" iconColor="text-blue-400" />
        <SettingRow icon={Globe} label="Lingua" description="Italiano" trailing={<span className="text-xs text-white/40">IT</span>} iconColor="text-emerald-400" />
        <SettingRow icon={User} label="Nome visualizzato" description="Luca Pilot" iconColor="text-violet-400" />
      </div>
    </div>
  );
}

function SecurityPanel() {
  return (
    <div>
      <SettingRow icon={Lock} label="Cambia Password" description="Ultima modifica: 15 giorni fa" iconColor="text-emerald-400" />
      <SettingRow icon={Shield} label="Autenticazione a due fattori" description="Non attiva" iconColor="text-amber-400"
        trailing={<span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400">OFF</span>} />
      <SettingRow icon={Monitor} label="Sessioni attive" description="2 dispositivi" iconColor="text-blue-400" />
      <SettingRow icon={Key} label="Token di accesso" description="3 token attivi" iconColor="text-rose-400" />
    </div>
  );
}

function NotificationsPanel() {
  const [emailOn, setEmailOn] = useState(true);
  const [pushOn, setPushOn] = useState(false);
  const [weeklyOn, setWeeklyOn] = useState(true);
  return (
    <div>
      <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.04]">
        <div>
          <div className="text-sm font-medium text-white/90">Notifiche email</div>
          <div className="text-xs text-white/35">Ricevi aggiornamenti via email</div>
        </div>
        <Toggle enabled={emailOn} onChange={() => setEmailOn(!emailOn)} />
      </div>
      <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.04]">
        <div>
          <div className="text-sm font-medium text-white/90">Notifiche push</div>
          <div className="text-xs text-white/35">Notifiche browser in tempo reale</div>
        </div>
        <Toggle enabled={pushOn} onChange={() => setPushOn(!pushOn)} />
      </div>
      <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.04]">
        <div>
          <div className="text-sm font-medium text-white/90">Report settimanale</div>
          <div className="text-xs text-white/35">Riepilogo attivit&agrave; ogni luned&igrave;</div>
        </div>
        <Toggle enabled={weeklyOn} onChange={() => setWeeklyOn(!weeklyOn)} />
      </div>
    </div>
  );
}

function ConnectionsPanel() {
  return (
    <div>
      <SettingRow icon={Globe} label="WCA Network" description="Sessione attiva"
        trailing={<span className="flex items-center gap-1.5 text-xs text-emerald-400"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Online</span>}
        iconColor="text-emerald-400" />
      <SettingRow icon={ExternalLink} label="LinkedIn Extension" description="Chrome extension installata" iconColor="text-blue-400" />
      <SettingRow icon={Mail} label="Email SMTP" description="Non configurato" iconColor="text-amber-400"
        trailing={<span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white/[0.06] text-white/40">Configura</span>} />
      <SettingRow icon={Zap} label="Webhook" description="2 webhook attivi" iconColor="text-violet-400" />
    </div>
  );
}

function ApiKeysPanel() {
  return (
    <div>
      <SettingRow icon={Zap} label="OpenAI API Key" description="sk-...7f3K"
        trailing={<span className="flex items-center gap-1.5 text-xs text-emerald-400"><Check className="w-3 h-3" /> Attiva</span>}
        iconColor="text-emerald-400" />
      <SettingRow icon={Globe} label="Google Maps API" description="Non configurata" iconColor="text-amber-400"
        trailing={<span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white/[0.06] text-white/40">Aggiungi</span>} />
      <SettingRow icon={Database} label="Supabase" description="Connesso"
        trailing={<span className="flex items-center gap-1.5 text-xs text-emerald-400"><Check className="w-3 h-3" /> OK</span>}
        iconColor="text-sky-400" />
    </div>
  );
}

function DataPanel() {
  return (
    <div>
      <SettingRow icon={Download} label="Esporta tutti i dati" description="CSV, JSON o Excel" iconColor="text-sky-400" />
      <SettingRow icon={Upload} label="Importa dati" description="Da file CSV o altro CRM" iconColor="text-emerald-400" />
      <SettingRow icon={HardDrive} label="Backup manuale" description="Ultimo: 2 ore fa" iconColor="text-violet-400" />
      <SettingRow icon={RefreshCw} label="Sincronizza" description="Forza sincronizzazione dati" iconColor="text-amber-400" />
      <SettingRow icon={Trash2} label="Cancella cache" description="Libera spazio temporaneo" iconColor="text-rose-400" />
    </div>
  );
}

function AppearancePanel() {
  const [theme, setTheme] = useState("dark");
  return (
    <div>
      <div className="p-5 border-b border-white/[0.04]">
        <div className="text-sm font-medium text-white/90 mb-3">Tema</div>
        <div className="flex gap-3">
          {[
            { id: "dark", label: "Scuro", icon: Moon },
            { id: "light", label: "Chiaro", icon: Sun },
            { id: "auto", label: "Auto", icon: Monitor },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setTheme(t.id)}
              className={cn(
                "flex-1 flex flex-col items-center gap-2 py-4 rounded-xl border transition-all duration-200",
                theme === t.id
                  ? "border-blue-500/50 bg-blue-500/10 text-blue-400"
                  : "border-white/[0.06] bg-white/[0.02] text-white/40 hover:bg-white/[0.04]"
              )}
            >
              <t.icon className="w-5 h-5" />
              <span className="text-xs font-medium">{t.label}</span>
            </button>
          ))}
        </div>
      </div>
      <SettingRow icon={Palette} label="Colore accento" description="Blu predefinito" iconColor="text-fuchsia-400" />
    </div>
  );
}

function SystemPanel() {
  return (
    <div>
      <div className="p-5 border-b border-white/[0.04]">
        <div className="text-sm font-medium text-white/90 mb-3">Stato Sistema</div>
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: "Database", status: "Operativo", ok: true },
            { label: "API", status: "Operativo", ok: true },
            { label: "Auth", status: "Operativo", ok: true },
            { label: "Storage", status: "82% usato", ok: true },
          ].map((s) => (
            <div key={s.label} className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-3">
              <div className="flex items-center gap-2 mb-1">
                <div className={cn("w-1.5 h-1.5 rounded-full", s.ok ? "bg-emerald-400 animate-pulse" : "bg-red-400")} />
                <span className="text-xs font-medium text-white/70">{s.label}</span>
              </div>
              <span className="text-[10px] text-white/35">{s.status}</span>
            </div>
          ))}
        </div>
      </div>
      <SettingRow icon={RefreshCw} label="Versione" description="Freight Pilot v2.0.0" iconColor="text-slate-400"
        trailing={<span className="text-[10px] text-white/30">Build 2026.03.17</span>} />
    </div>
  );
}

const PANELS: Record<string, React.FC> = {
  profile: ProfilePanel,
  security: SecurityPanel,
  notifications: NotificationsPanel,
  connections: ConnectionsPanel,
  api: ApiKeysPanel,
  data: DataPanel,
  appearance: AppearancePanel,
  system: SystemPanel,
};

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState("profile");
  const activeSec = SECTIONS.find((s) => s.id === activeSection) || SECTIONS[0];
  const PanelComponent = PANELS[activeSection] || ProfilePanel;

  return (
    <div className="h-full w-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex-shrink-0 px-8 pt-8 pb-4">
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-2xl font-bold text-white tracking-tight"
        >
          Impostazioni
        </motion.h1>
        <p className="text-sm text-white/30 mt-1">Configura il tuo Freight Pilot</p>
      </div>

      <div className="flex-1 flex overflow-hidden px-8 pb-8 gap-6">
        {/* Left: Section cards grid */}
        <div className="w-72 flex-shrink-0 overflow-auto pr-2">
          <div className="space-y-1.5">
            {SECTIONS.map((section, i) => {
              const Icon = section.icon;
              const isActive = activeSection === section.id;

              return (
                <motion.button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04, duration: 0.3 }}
                  className={cn(
                    "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all duration-300 group",
                    isActive
                      ? "bg-white/[0.06] border border-white/[0.1]"
                      : "bg-transparent border border-transparent hover:bg-white/[0.03]"
                  )}
                >
                  <motion.div
                    animate={{ scale: isActive ? 1.1 : 1 }}
                    className={cn(
                      "w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-300",
                      isActive ? "bg-white/[0.08]" : "bg-white/[0.03] group-hover:bg-white/[0.05]"
                    )}
                    style={isActive ? { boxShadow: `0 0 20px ${section.glow}` } : {}}
                  >
                    <Icon className={cn(
                      "w-4 h-4 transition-colors duration-300",
                      isActive ? section.iconColor : "text-white/30 group-hover:text-white/50"
                    )} />
                  </motion.div>
                  <div className="min-w-0">
                    <div className={cn(
                      "text-sm font-medium transition-colors duration-300",
                      isActive ? "text-white" : "text-white/50 group-hover:text-white/70"
                    )}>
                      {section.label}
                    </div>
                    <div className="text-[10px] text-white/25 truncate">{section.description}</div>
                  </div>
                  {isActive && (
                    <motion.div
                      layoutId="settingsActive"
                      className={cn("ml-auto w-1 h-6 rounded-full bg-gradient-to-b", section.gradient)}
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Right: Detail panel with glassmorphism + thumbnail→zoom animation */}
        <div className="flex-1 overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSection}
              initial={{ opacity: 0, scale: 0.9, borderRadius: "24px" }}
              animate={{ opacity: 1, scale: 1, borderRadius: "16px" }}
              exit={{ opacity: 0, scale: 0.95, borderRadius: "20px" }}
              transition={{
                duration: 0.35,
                ease: [0.22, 1, 0.36, 1],
                scale: { type: "spring", stiffness: 300, damping: 28 },
              }}
              className="h-full overflow-auto rounded-2xl border border-white/[0.06] bg-white/[0.025] backdrop-blur-xl"
              style={{ boxShadow: `0 0 60px ${activeSec.glow.replace("0.3", "0.06")}` }}
            >
              {/* Panel header */}
              <div className="sticky top-0 z-10 px-6 py-5 border-b border-white/[0.06] bg-white/[0.02] backdrop-blur-xl">
                <div className="flex items-center gap-3">
                  <div
                    className={cn("w-10 h-10 rounded-xl flex items-center justify-center", activeSec.iconColor)}
                    style={{ backgroundColor: activeSec.glow.replace("0.3", "0.1") }}
                  >
                    <activeSec.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-white">{activeSec.label}</h2>
                    <p className="text-xs text-white/35">{activeSec.description}</p>
                  </div>
                </div>
              </div>

              {/* Panel content */}
              <PanelComponent />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

import { ReactNode, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Radar, Globe, Rocket, Send, BarChart3, Settings, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface MasterPageShellProps {
  activePage: string;
  children: ReactNode;
  onPageChange: (page: string) => void;
}

const PAGES = [
  { id: "radar", label: "RADAR", icon: Radar, gradient: "from-rose-500 to-orange-400", glow: "rgba(244,63,94,0.4)", bg: "rgba(244,63,94,0.08)", hoverBg: "rgba(244,63,94,0.15)", iconColor: "text-rose-400" },
  { id: "network", label: "NETWORK", icon: Globe, gradient: "from-sky-500 to-cyan-400", glow: "rgba(14,165,233,0.4)", bg: "rgba(14,165,233,0.08)", hoverBg: "rgba(14,165,233,0.15)", iconColor: "text-sky-400" },
  { id: "cockpit", label: "COCKPIT", icon: Rocket, gradient: "from-violet-500 to-purple-400", glow: "rgba(139,92,246,0.4)", bg: "rgba(139,92,246,0.08)", hoverBg: "rgba(139,92,246,0.15)", iconColor: "text-violet-400" },
  { id: "launch", label: "LAUNCH", icon: Send, gradient: "from-emerald-500 to-teal-400", glow: "rgba(16,185,129,0.4)", bg: "rgba(16,185,129,0.08)", hoverBg: "rgba(16,185,129,0.15)", iconColor: "text-emerald-400" },
  { id: "control", label: "CONTROL", icon: BarChart3, gradient: "from-amber-500 to-yellow-400", glow: "rgba(245,158,11,0.4)", bg: "rgba(245,158,11,0.08)", hoverBg: "rgba(245,158,11,0.15)", iconColor: "text-amber-400" },
  { id: "settings", label: "SETTINGS", icon: Settings, gradient: "from-slate-400 to-zinc-400", glow: "rgba(148,163,184,0.3)", bg: "rgba(148,163,184,0.06)", hoverBg: "rgba(148,163,184,0.12)", iconColor: "text-slate-400" },
];

export default function MasterPageShell({ activePage, children, onPageChange }: MasterPageShellProps) {
  const [hoveredTab, setHoveredTab] = useState<string | null>(null);
  const activeDef = PAGES.find((p) => p.id === activePage) || PAGES[0];

  return (
    <div className="relative w-full h-screen bg-[#06060e] overflow-hidden flex flex-col">
      <motion.div className="absolute inset-0 pointer-events-none" animate={{ opacity: 1 }} transition={{ duration: 1.5 }}>
        <div className="absolute w-[800px] h-[800px] rounded-full blur-[200px] -top-96 left-1/2 -translate-x-1/2 transition-colors duration-1000" style={{ backgroundColor: activeDef.glow, opacity: 0.15 }} />
        <div className="absolute w-[400px] h-[400px] rounded-full blur-[150px] bottom-0 right-0 transition-colors duration-1000" style={{ backgroundColor: activeDef.glow, opacity: 0.06 }} />
      </motion.div>
      <div className="absolute inset-0 pointer-events-none opacity-[0.03]" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)", backgroundSize: "60px 60px" }} />
      <nav className="relative z-30 flex-shrink-0 border-b border-white/[0.06]">
        <div className="h-16 px-4 flex items-center">
          <motion.div className="flex items-center gap-2.5 mr-6 pr-6 border-r border-white/[0.08] cursor-default" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}>
            <div className="relative">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 via-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/20"><Sparkles className="w-4 h-4 text-white" /></div>
              <motion.div className="absolute inset-0 rounded-xl bg-gradient-to-br from-blue-500 to-violet-500" animate={{ opacity: [0.3, 0.6, 0.3], scale: [1, 1.15, 1] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }} style={{ filter: "blur(8px)" }} />
            </div>
            <div>
              <div className="text-sm font-bold text-white tracking-tight">Freight Pilot</div>
              <div className="text-[9px] font-medium text-white/30 tracking-[0.2em] uppercase">Super CRM</div>
            </div>
          </motion.div>
          <div className="flex items-center gap-1 flex-1 overflow-x-auto">
            {PAGES.map((page, i) => {
              const Icon = page.icon;
              const isActive = activePage === page.id;
              const isHovered = hoveredTab === page.id;
              return (
                <motion.button key={page.id} onClick={() => onPageChange(page.id)} onMouseEnter={() => setHoveredTab(page.id)} onMouseLeave={() => setHoveredTab(null)} initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06, duration: 0.5, ease: [0.32, 0.72, 0, 1] }} className={cn("relative flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold tracking-wide transition-all duration-300 outline-none flex-shrink-0", isActive ? "text-white" : "text-white/35")} style={{ backgroundColor: isActive ? page.bg : isHovered ? page.hoverBg : "transparent" }}>
                  <motion.div animate={{ scale: isActive ? 1.1 : isHovered ? 1.2 : 1, rotate: isHovered && !isActive ? 8 : 0 }} transition={{ type: "spring", stiffness: 300, damping: 20 }}>
                    <Icon className={cn("w-4 h-4 transition-colors duration-300", isActive ? page.iconColor : isHovered ? page.iconColor : "text-white/30")} />
                  </motion.div>
                  <span className={cn("transition-colors duration-300 hidden sm:inline", isHovered && !isActive && "text-white/70")}>{page.label}</span>
                  {isActive && (<motion.div layoutId="activeTabLine" className={cn("absolute -bottom-[1px] left-3 right-3 h-[2px] rounded-full bg-gradient-to-r", page.gradient)} transition={{ type: "spring", stiffness: 400, damping: 30 }} />)}
                  <AnimatePresence>
                    {isHovered && !isActive && (<motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }} transition={{ duration: 0.3 }} className="absolute inset-0 rounded-xl pointer-events-none" style={{ boxShadow: "inset 0 0 20px " + page.glow.replace("0.4", "0.08") + ", 0 0 15px " + page.glow.replace("0.4", "0.06") }} />)}
                  </AnimatePresence>
                </motion.button>
              );
            })}
          </div>
        </div>
      </nav>
      <div className="relative z-10 flex-1 overflow-hidden bg-white/[0.01]">
        {children}
      </div>
    </div>
  );
}

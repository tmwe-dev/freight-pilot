import { ReactNode } from "react";
import { motion } from "framer-motion";
import { Radar, Globe, Rocket, Send, BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";

interface MasterPageShellProps {
  activePage: string;
  children: ReactNode;
  onPageChange: (page: string) => void;
}

const PAGES = [
  { id: "radar", label: "RADAR", icon: Radar, color: "from-red-500 to-orange-500" },
  { id: "network", label: "NETWORK", icon: Globe, color: "from-blue-500 to-cyan-500" },
  { id: "cockpit", label: "COCKPIT", icon: Rocket, color: "from-violet-500 to-purple-500" },
  { id: "launch", label: "LAUNCH", icon: Send, color: "from-emerald-500 to-green-500" },
  { id: "control", label: "CONTROL", icon: BarChart3, color: "from-amber-500 to-yellow-500" },
];

export default function MasterPageShell({
  activePage,
  children,
  onPageChange,
}: MasterPageShellProps) {
  return (
    <div className="relative w-full h-screen bg-[#0a0a14] overflow-hidden flex flex-col">
      {/* Subtle background gradients */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute w-[600px] h-[600px] bg-blue-500/[0.04] rounded-full blur-[120px] -top-64 -left-64" />
        <div className="absolute w-[600px] h-[600px] bg-violet-500/[0.04] rounded-full blur-[120px] -bottom-64 -right-64" />
      </div>

      {/* Top Navigation Bar */}
      <nav className="relative z-20 h-14 border-b border-white/[0.06] bg-white/[0.02] backdrop-blur-xl flex-shrink-0">
        <div className="h-full px-6 flex items-center gap-1">
          {/* Logo */}
          <div className="flex items-center gap-2 mr-6 pr-6 border-r border-white/[0.08]">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center">
              <Rocket className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-sm font-semibold text-white/90 tracking-tight">Freight Pilot</span>
          </div>

          {/* Page tabs */}
          {PAGES.map((page) => {
            const Icon = page.icon;
            const isActive = activePage === page.id;

            return (
              <button
                key={page.id}
                onClick={() => onPageChange(page.id)}
                className={cn(
                  "relative flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold tracking-wide transition-all duration-200",
                  isActive
                    ? "text-white bg-white/[0.08]"
                    : "text-white/40 hover:text-white/70 hover:bg-white/[0.04]"
                )}
              >
                <Icon className={cn("w-3.5 h-3.5", isActive && "text-blue-400")} />
                <span>{page.label}</span>

                {/* Active indicator line */}
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className={cn("absolute bottom-0 left-2 right-2 h-[2px] rounded-full bg-gradient-to-r", page.color)}
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </nav>

      {/* Main content area */}
      <div className="relative z-10 flex-1 overflow-hidden">
        {children}
      </div>
    </div>
  );
}

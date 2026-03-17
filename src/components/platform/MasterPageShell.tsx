import { ReactNode } from "react";
import { motion, AnimatePresence, layoutId } from "framer-motion";
import { Radar, Globe, Rocket, Send, BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";
import WowBackground from "./WowBackground";

interface MasterPageShellProps {
  activePage: string;
  children: ReactNode;
  onPageChange: (page: string) => void;
  aiCompanion?: ReactNode;
}

const PAGES = [
  { id: "RADAR", label: "RADAR", icon: Radar },
  { id: "NETWORK", label: "NETWORK", icon: Globe },
  { id: "COCKPIT", label: "COCKPIT", icon: Rocket },
  { id: "LAUNCH", label: "LAUNCH", icon: Send },
  { id: "CONTROL", label: "CONTROL", icon: BarChart3 },
];

export default function MasterPageShell({
  activePage,
  children,
  onPageChange,
  aiCompanion,
}: MasterPageShellProps) {
  return (
    <div className="relative w-full h-screen bg-black overflow-hidden">
      {/* Animated background */}
      <WowBackground variant="default" intensity="medium" />

      {/* Main container with layout grid */}
      <div className="relative z-10 h-screen flex flex-col">
        {/* Top Navigation Bar */}
        <div className="border-b border-white/5 bg-white/[0.02] backdrop-blur-xl">
          <nav className="h-16 px-8 flex items-center gap-8 overflow-x-auto scrollbar-hide">
            {PAGES.map((page) => {
              const Icon = page.icon;
              const isActive = activePage === page.id;

              return (
                <motion.button
                  key={page.id}
                  onClick={() => onPageChange(page.id)}
                  className={cn(
                    "relative flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap",
                    isActive
                      ? "text-white"
                      : "text-white/50 hover:text-white/70"
                  )}
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Icon className="w-4 h-4" />
                  <span>{page.label}</span>

                  {/* Animated underline indicator */}
                  {isActive && (
                    <motion.div
                      layoutId="activePageIndicator"
                      className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-white via-white to-white/50 rounded-t-lg"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    />
                  )}

                  {/* Glow effect for active page */}
                  {isActive && (
                    <motion.div
                      className="absolute inset-0 rounded-lg bg-white/10"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: [0.3, 0.6, 0.3] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      style={{ filter: "blur(8px)" }}
                    />
                  )}
                </motion.button>
              );
            })}
          </nav>
        </div>

        {/* Main content area */}
        <div className="flex-1 flex overflow-hidden">
          {/* Page content */}
          <div className="flex-1 overflow-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={activePage}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="h-full"
              >
                {children}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* AI Companion slot */}
          {aiCompanion && (
            <div className="w-80 border-l border-white/5 bg-white/[0.02] backdrop-blur-xl overflow-hidden">
              {aiCompanion}
            </div>
          )}
        </div>
      </div>

      {/* Floating particles background effect */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute w-96 h-96 bg-white/5 rounded-full blur-3xl -top-48 -left-48 animate-float" />
        <div className="absolute w-96 h-96 bg-white/5 rounded-full blur-3xl -bottom-48 -right-48 animate-float animation-delay-2000" />
      </div>
    </div>
  );
}

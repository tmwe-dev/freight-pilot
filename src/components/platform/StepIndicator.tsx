import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface StepIndicatorProps {
  steps: number;
  current: number;
  labels?: string[];
  color?: string;
}

export default function StepIndicator({
  steps,
  current,
  labels,
  color = "white",
}: StepIndicatorProps) {
  const colorMap: Record<string, string> = {
    white: "bg-white",
    blue: "bg-blue-500",
    purple: "bg-purple-500",
    green: "bg-green-500",
    red: "bg-red-500",
  };

  const baseColor = colorMap[color] || colorMap.white;

  return (
    <div className="flex flex-col items-center gap-3">
      {/* Dots */}
      <div className="flex items-center gap-3">
        {Array.from({ length: steps }).map((_, index) => {
          const isActive = index === current;
          const isPassed = index < current;

          return (
            <motion.div
              key={index}
              layout
              className={cn(
                "rounded-full transition-all",
                isActive
                  ? cn(baseColor, "opacity-100 w-8 h-3 rounded-full")
                  : isPassed
                    ? cn(baseColor, "opacity-40 w-3 h-3")
                    : "bg-white/20 opacity-30 w-3 h-3"
              )}
              initial={false}
              animate={{
                scale: isActive ? 1 : 0.8,
              }}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 30,
              }}
            />
          );
        })}
      </div>

      {/* Labels */}
      {labels && labels.length > 0 && (
        <div className="flex items-center gap-3 text-xs">
          {labels.map((label, index) => {
            const isActive = index === current;

            return (
              <motion.span
                key={index}
                className={cn(
                  "whitespace-nowrap transition-colors",
                  isActive ? "text-white font-medium" : "text-white/40"
                )}
                animate={{
                  opacity: isActive ? 1 : 0.4,
                }}
              >
                {label}
              </motion.span>
            );
          })}
        </div>
      )}

      {/* Counter */}
      <div className="text-xs text-white/50 font-medium">
        {current + 1} / {steps}
      </div>
    </div>
  );
}

import { ReactNode } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface GlassCardProps {
  children: ReactNode;
  variant?: "default" | "interactive" | "highlighted";
  className?: string;
  onClick?: () => void;
  glowColor?: "white" | "blue" | "purple" | "green" | "red";
}

const glowColorMap = {
  white: "group-hover:shadow-[0_0_20px_rgba(255,255,255,0.1)]",
  blue: "group-hover:shadow-[0_0_20px_rgba(59,130,246,0.15)]",
  purple: "group-hover:shadow-[0_0_20px_rgba(168,85,247,0.15)]",
  green: "group-hover:shadow-[0_0_20px_rgba(34,197,94,0.15)]",
  red: "group-hover:shadow-[0_0_20px_rgba(239,68,68,0.15)]",
};

export default function GlassCard({
  children,
  variant = "default",
  className,
  onClick,
  glowColor = "white",
}: GlassCardProps) {
  const isInteractive = variant === "interactive" || !!onClick;

  const baseStyles = cn(
    "rounded-xl bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] transition-all duration-300",
    className
  );

  const variantStyles = {
    default: "hover:border-white/[0.08]",
    interactive: cn(
      "cursor-pointer hover:border-white/[0.12] hover:bg-white/[0.05]",
      glowColorMap[glowColor]
    ),
    highlighted: cn(
      "border-white/[0.12] hover:border-white/[0.20] hover:bg-white/[0.06]",
      glowColorMap[glowColor]
    ),
  };

  const MotionComponent = motion.div;

  return (
    <MotionComponent
      onClick={onClick}
      whileHover={isInteractive ? { scale: 1.01 } : {}}
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 30,
      }}
      className={cn(
        "group relative",
        isInteractive && "cursor-pointer"
      )}
    >
      <div className={cn(baseStyles, variantStyles[variant])}>
        {/* Shimmer effect overlay for interactive cards */}
        {isInteractive && (
          <div className="absolute inset-0 rounded-xl overflow-hidden pointer-events-none">
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-10"
              initial={{ x: "-100%" }}
              whileHover={{ x: "100%" }}
              transition={{ duration: 0.8 }}
            />
          </div>
        )}

        {/* Content */}
        <div className="relative z-10">{children}</div>
      </div>

      {/* Border glow for highlighted variant */}
      {variant === "highlighted" && (
        <motion.div
          className="absolute inset-0 rounded-xl border border-white/10 pointer-events-none"
          animate={{ opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      )}
    </MotionComponent>
  );
}

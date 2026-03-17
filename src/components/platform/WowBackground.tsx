import { useMemo } from "react";
import { cn } from "@/lib/utils";

interface WowBackgroundProps {
  variant?: "default" | "radar" | "network" | "cockpit" | "launch" | "control";
  intensity?: "low" | "medium" | "high";
}

interface Particle {
  id: number;
  left: string;
  top: string;
  size: number;
  duration: number;
  delay: number;
  opacity: number;
}

export default function WowBackground({
  variant = "default",
  intensity = "medium",
}: WowBackgroundProps) {
  const particleCount = useMemo(() => {
    switch (intensity) {
      case "low":
        return 15;
      case "high":
        return 60;
      default:
        return 30;
    }
  }, [intensity]);

  const particles: Particle[] = useMemo(() => {
    return Array.from({ length: particleCount }).map((_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      size: Math.random() * 4 + 1,
      duration: Math.random() * 20 + 15,
      delay: Math.random() * 5,
      opacity: Math.random() * 0.6 + 0.1,
    }));
  }, [particleCount]);

  const variantColors = {
    default: {
      primary: "rgba(255, 255, 255, 0.8)",
      secondary: "rgba(100, 200, 255, 0.3)",
      tertiary: "rgba(200, 100, 255, 0.2)",
    },
    radar: {
      primary: "rgba(255, 100, 100, 0.8)",
      secondary: "rgba(255, 150, 100, 0.3)",
      tertiary: "rgba(255, 200, 100, 0.2)",
    },
    network: {
      primary: "rgba(100, 200, 255, 0.8)",
      secondary: "rgba(100, 150, 255, 0.3)",
      tertiary: "rgba(100, 100, 255, 0.2)",
    },
    cockpit: {
      primary: "rgba(150, 255, 100, 0.8)",
      secondary: "rgba(100, 255, 150, 0.3)",
      tertiary: "rgba(100, 200, 100, 0.2)",
    },
    launch: {
      primary: "rgba(255, 200, 100, 0.8)",
      secondary: "rgba(255, 150, 100, 0.3)",
      tertiary: "rgba(200, 100, 255, 0.2)",
    },
    control: {
      primary: "rgba(200, 100, 255, 0.8)",
      secondary: "rgba(150, 100, 255, 0.3)",
      tertiary: "rgba(100, 100, 255, 0.2)",
    },
  };

  const colors = variantColors[variant];

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Animated gradient orbs */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) translateX(0px); }
          25% { transform: translateY(-30px) translateX(10px); }
          50% { transform: translateY(-60px) translateX(0px); }
          75% { transform: translateY(-30px) translateX(-10px); }
        }

        @keyframes pulse-slow {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.7; }
        }

        @keyframes drift {
          0% { transform: translate(0, 0); }
          50% { transform: translate(50px, -50px); }
          100% { transform: translate(0, 0); }
        }

        .particle {
          animation: float var(--duration)s infinite ease-in-out;
          animation-delay: var(--delay)s;
          will-change: transform;
        }

        .orb {
          animation: pulse-slow 4s ease-in-out infinite;
          will-change: opacity;
        }

        .orb-drift {
          animation: drift 6s ease-in-out infinite;
          will-change: transform;
        }
      `}</style>

      {/* Floating particles */}
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="particle absolute rounded-full bg-white/40 blur-sm"
          style={{
            left: particle.left,
            top: particle.top,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            "--duration": `${particle.duration}s`,
            "--delay": `${particle.delay}s`,
            opacity: particle.opacity,
          } as React.CSSProperties}
        />
      ))}

      {/* Gradient orbs with pulsing effect */}
      <div className="absolute inset-0">
        {/* Primary orb - top left */}
        <div
          className="orb absolute blur-3xl rounded-full w-96 h-96 -top-48 -left-48"
          style={{
            background: `radial-gradient(circle, ${colors.primary} 0%, transparent 70%)`,
          }}
        />

        {/* Secondary orb - top right */}
        <div
          className="orb orb-drift absolute blur-3xl rounded-full w-72 h-72 -top-36 -right-36"
          style={{
            background: `radial-gradient(circle, ${colors.secondary} 0%, transparent 70%)`,
          }}
        />

        {/* Tertiary orb - bottom center */}
        <div
          className="orb absolute blur-3xl rounded-full w-80 h-80 -bottom-40 left-1/2 -translate-x-1/2"
          style={{
            background: `radial-gradient(circle, ${colors.tertiary} 0%, transparent 70%)`,
          }}
        />

        {/* Additional floating orb - middle right */}
        <div
          className="orb orb-drift absolute blur-3xl rounded-full w-64 h-64 top-1/3 -right-32"
          style={{
            background: `radial-gradient(circle, ${colors.secondary} 0%, transparent 70%)`,
            animationDelay: "3s",
          }}
        />
      </div>

      {/* Subtle animated grid overlay */}
      <div className="absolute inset-0 opacity-5 pointer-events-none">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
              <path
                d="M 50 0 L 0 0 0 50"
                fill="none"
                stroke="white"
                strokeWidth="0.5"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      {/* Radial gradient overlay for depth */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at 50% 50%, transparent 0%, rgba(0, 0, 0, 0.4) 100%)",
        }}
      />
    </div>
  );
}

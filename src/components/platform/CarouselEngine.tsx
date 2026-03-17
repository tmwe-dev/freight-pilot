import { useRef, useCallback, ReactNode, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface CarouselEngineProps {
  children: ReactNode[];
  currentIndex: number;
  onIndexChange: (index: number) => void;
  labels?: string[];
}

export default function CarouselEngine({
  children,
  currentIndex,
  onIndexChange,
  labels,
}: CarouselEngineProps) {
  const totalItems = children.length;
  const wheelLock = useRef(false);
  const touchStartX = useRef(0);
  const directionRef = useRef<"next" | "prev">("next");

  // Throttled navigation — prevents trackpad from going crazy
  const goTo = useCallback(
    (direction: "next" | "prev") => {
      if (wheelLock.current) return;
      wheelLock.current = true;
      directionRef.current = direction;

      if (direction === "next" && currentIndex < totalItems - 1) {
        onIndexChange(currentIndex + 1);
      } else if (direction === "prev" && currentIndex > 0) {
        onIndexChange(currentIndex - 1);
      }

      setTimeout(() => {
        wheelLock.current = false;
      }, 250);
    },
    [currentIndex, totalItems, onIndexChange]
  );

  // Wheel handler with throttle
  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      // Only respond to significant horizontal scrolling
      if (Math.abs(e.deltaX) > 30 && Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
        e.preventDefault();
        goTo(e.deltaX > 0 ? "next" : "prev");
      }
      // Also respond to significant vertical scrolling (some trackpads)
      else if (Math.abs(e.deltaY) > 50 && Math.abs(e.deltaY) > Math.abs(e.deltaX) * 2) {
        e.preventDefault();
        goTo(e.deltaY > 0 ? "next" : "prev");
      }
    },
    [goTo]
  );

  // Touch handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 60) {
      goTo(diff > 0 ? "next" : "prev");
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        goTo("prev");
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        goTo("next");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [goTo]);

  // Determine slide direction based on navigation direction
  const slideVariants = {
    enter: (direction: "next" | "prev") => ({
      x: direction === "next" ? 100 : -100,
      opacity: 0,
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
    },
    exit: (direction: "next" | "prev") => ({
      zIndex: 0,
      x: direction === "next" ? -100 : 100,
      opacity: 0,
    }),
  };

  return (
    <div
      className="relative w-full h-full flex flex-col"
      onWheel={handleWheel}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Canvas content with animated transitions */}
      <div className="flex-1 overflow-hidden relative">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={currentIndex}
            custom={directionRef.current}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: "spring", stiffness: 200, damping: 25, duration: 0.5 },
              opacity: { duration: 0.5, ease: [0.32, 0.72, 0, 1] },
            }}
            className="absolute inset-0 overflow-auto"
          >
            {children[currentIndex]}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Step indicator bar */}
      <div className="flex-shrink-0 px-6 py-3 border-t border-white/[0.06] bg-white/[0.02] backdrop-blur-xl flex items-center justify-center gap-3">
        {Array.from({ length: totalItems }).map((_, i) => (
          <motion.button
            key={i}
            onClick={() => {
              directionRef.current = i > currentIndex ? "next" : "prev";
              onIndexChange(i);
            }}
            className="flex items-center gap-2 group"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <motion.div
              layout
              className={cn(
                "h-1.5 rounded-full transition-all duration-500",
                i === currentIndex
                  ? "w-8 bg-gradient-to-r from-blue-400 to-violet-400"
                  : "w-1.5 bg-white/20 group-hover:bg-white/40"
              )}
            />
            {labels && labels[i] && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{
                  opacity: i === currentIndex ? 1 : 0.3,
                }}
                transition={{ duration: 0.3 }}
                className={cn(
                  "text-[10px] font-medium transition-colors hidden md:inline-block",
                  i === currentIndex ? "text-white/80" : "text-white/30"
                )}
              >
                {labels[i]}
              </motion.span>
            )}
          </motion.button>
        ))}
      </div>
    </div>
  );
}

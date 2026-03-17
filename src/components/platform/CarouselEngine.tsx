import { useRef, useCallback, ReactNode } from "react";
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

  const goTo = useCallback(
    (direction: "next" | "prev") => {
      if (wheelLock.current) return;
      wheelLock.current = true;
      if (direction === "next" && currentIndex < totalItems - 1) {
        onIndexChange(currentIndex + 1);
      } else if (direction === "prev" && currentIndex > 0) {
        onIndexChange(currentIndex - 1);
      }
      setTimeout(() => { wheelLock.current = false; }, 400);
    },
    [currentIndex, totalItems, onIndexChange]
  );

  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      if (Math.abs(e.deltaX) > 30 && Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
        e.preventDefault();
        goTo(e.deltaX > 0 ? "next" : "prev");
      } else if (Math.abs(e.deltaY) > 50 && Math.abs(e.deltaY) > Math.abs(e.deltaX) * 2) {
        e.preventDefault();
        goTo(e.deltaY > 0 ? "next" : "prev");
      }
    },
    [goTo]
  );

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 60) {
      goTo(diff > 0 ? "next" : "prev");
    }
  };

  return (
    <div
      className="relative w-full h-full flex flex-col"
      onWheel={handleWheel}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div className="flex-1 overflow-hidden relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 60 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -60 }}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            className="absolute inset-0 overflow-auto"
          >
            {children[currentIndex]}
          </motion.div>
        </AnimatePresence>
      </div>
      <div className="flex-shrink-0 px-6 py-3 border-t border-white/[0.06] bg-white/[0.02] backdrop-blur-xl flex items-center justify-center gap-3">
        {Array.from({ length: totalItems }).map((_, i) => (
          <button key={i} onClick={() => onIndexChange(i)} className="flex items-center gap-2 group">
            <div className={cn(
              "h-1.5 rounded-full transition-all duration-300",
              i === currentIndex ? "w-8 bg-gradient-to-r from-blue-400 to-violet-400" : "w-1.5 bg-white/20 group-hover:bg-white/40"
            )} />
            {labels && labels[i] && (
              <span className={cn("text-[10px] font-medium transition-colors", i === currentIndex ? "text-white/80" : "text-white/30")}>{labels[i]}</span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

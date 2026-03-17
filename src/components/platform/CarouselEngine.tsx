import { useRef, useEffect, ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import StepIndicator from "./StepIndicator";

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
  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);

  const totalItems = children.length;

  const handleTouchStart = (e: React.TouchEvent) => {
    isDragging.current = true;
    startX.current = e.touches[0].clientX;
    scrollLeft.current = containerRef.current?.scrollLeft || 0;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging.current) return;

    const x = e.touches[0].clientX;
    const walk = startX.current - x;

    if (containerRef.current) {
      containerRef.current.scrollLeft = scrollLeft.current + walk;
    }
  };

  const handleTouchEnd = () => {
    isDragging.current = false;

    if (!containerRef.current) return;

    const container = containerRef.current;
    const itemWidth = container.clientWidth;
    const scrolled = container.scrollLeft;

    // Determine which index to snap to
    const newIndex = Math.round(scrolled / itemWidth);
    const clampedIndex = Math.max(0, Math.min(newIndex, totalItems - 1));

    onIndexChange(clampedIndex);

    // Smooth snap animation
    container.scrollTo({
      left: clampedIndex * itemWidth,
      behavior: "smooth",
    });
  };

  const handleWheel = (e: React.WheelEvent) => {
    if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
      e.preventDefault();

      const container = containerRef.current;
      if (!container) return;

      const itemWidth = container.clientWidth;
      let newIndex = currentIndex;

      if (e.deltaX > 0) {
        // Scroll right
        newIndex = Math.min(currentIndex + 1, totalItems - 1);
      } else {
        // Scroll left
        newIndex = Math.max(currentIndex - 1, 0);
      }

      onIndexChange(newIndex);

      container.scrollTo({
        left: newIndex * itemWidth,
        behavior: "smooth",
      });
    }
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "ArrowLeft") {
      const newIndex = Math.max(currentIndex - 1, 0);
      onIndexChange(newIndex);
      containerRef.current?.scrollTo({
        left: newIndex * (containerRef.current?.clientWidth || 0),
        behavior: "smooth",
      });
    } else if (e.key === "ArrowRight") {
      const newIndex = Math.min(currentIndex + 1, totalItems - 1);
      onIndexChange(newIndex);
      containerRef.current?.scrollTo({
        left: newIndex * (containerRef.current?.clientWidth || 0),
        behavior: "smooth",
      });
    }
  };

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentIndex, totalItems]);

  return (
    <div className="relative w-full h-full flex flex-col">
      {/* Carousel container */}
      <div
        ref={containerRef}
        className="flex-1 overflow-x-hidden overflow-y-hidden snap-x snap-mandatory scroll-smooth"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onWheel={handleWheel}
      >
        <div className="flex h-full">
          {children.map((child, index) => (
            <motion.div
              key={index}
              className="w-full h-full flex-shrink-0 snap-center"
              animate={{
                x: currentIndex === index ? 0 : 0,
                opacity: Math.abs(currentIndex - index) > 1 ? 0.3 : 1,
              }}
              transition={{ duration: 0.3 }}
            >
              {/* Parallax effect for adjacent panels */}
              <motion.div
                animate={{
                  x: (index - currentIndex) * 10,
                }}
                transition={{ duration: 0.6, type: "spring", stiffness: 100 }}
              >
                {child}
              </motion.div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Edge glow effects */}
      {currentIndex === 0 && (
        <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-white/10 to-transparent pointer-events-none" />
      )}
      {currentIndex === totalItems - 1 && (
        <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-white/10 to-transparent pointer-events-none" />
      )}

      {/* Step indicator */}
      <div className="px-6 py-4 border-t border-white/5 bg-white/[0.02] backdrop-blur-xl flex justify-center">
        <StepIndicator
          steps={totalItems}
          current={currentIndex}
          labels={labels}
          color="white"
        />
      </div>
    </div>
  );
}

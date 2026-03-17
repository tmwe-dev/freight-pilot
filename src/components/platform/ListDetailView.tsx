import { ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import GlassCard from "./GlassCard";

interface ListDetailViewProps<T> {
  items: T[];
  renderItem: (item: T, isActive: boolean) => ReactNode;
  renderDetail: (item: T) => ReactNode;
  selectedId?: string | null;
  onSelect: (id: string) => void;
  itemKeyExtractor?: (item: T) => string;
}

export default function ListDetailView<T>({
  items,
  renderItem,
  renderDetail,
  selectedId,
  onSelect,
  itemKeyExtractor = (item: T) => (item as any).id,
}: ListDetailViewProps<T>) {
  const selectedItem = items.find((item) => itemKeyExtractor(item) === selectedId);
  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;

  return (
    <div className="w-full h-full flex gap-4 p-6">
      {/* List panel */}
      {(!isMobile || !selectedId) && (
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className={cn(
            "flex flex-col gap-2 border-r border-white/5 pr-4",
            isMobile ? "w-full" : "w-80 flex-shrink-0"
          )}
        >
          <div className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-2">
            {items.length} Items
          </div>

          {/* Items list */}
          <div className="flex-1 overflow-y-auto space-y-2 scrollbar-hide">
            {items.map((item) => {
              const itemId = itemKeyExtractor(item);
              const isActive = itemId === selectedId;

              return (
                <motion.button
                  key={itemId}
                  onClick={() => onSelect(itemId)}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  className={cn(
                    "w-full text-left rounded-lg px-4 py-3 border transition-all duration-300",
                    isActive
                      ? "bg-white/10 border-white/20 ring-1 ring-white/20"
                      : "bg-white/[0.03] border-white/5 hover:border-white/10 hover:bg-white/[0.05]"
                  )}
                >
                  {renderItem(item, isActive)}
                </motion.button>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Detail panel */}
      <AnimatePresence mode="wait">
        {selectedItem && (
          <motion.div
            key={selectedId}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3 }}
            className={cn(
              "flex-1 flex flex-col",
              isMobile ? "w-full" : ""
            )}
          >
            {/* Mobile back button */}
            {isMobile && (
              <button
                onClick={() => onSelect("")}
                className="flex items-center gap-2 mb-4 px-4 py-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 text-white/70 hover:text-white text-sm transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                Back
              </button>
            )}

            {/* Detail content in glass card */}
            <GlassCard variant="default" className="flex-1 p-6 overflow-y-auto">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
              >
                {renderDetail(selectedItem)}
              </motion.div>
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Empty state */}
      {!selectedItem && !isMobile && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex-1 flex items-center justify-center"
        >
          <div className="text-center">
            <div className="text-white/40 text-lg mb-2">No item selected</div>
            <div className="text-white/30 text-sm">
              Click on an item from the list to view details
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowUpDown, Search, Calendar, Filter } from "lucide-react";
import { cn } from "@/lib/utils";
import GlassCard from "./GlassCard";

export interface FilterConfig {
  id: string;
  type: "text" | "select" | "dateRange" | "toggle";
  label: string;
  placeholder?: string;
  options?: Array<{ label: string; value: string }>;
}

export interface SortOption {
  id: string;
  label: string;
}

interface GlobalFiltersProps {
  filters: FilterConfig[];
  activeFilters: Record<string, any>;
  onFilterChange: (filterId: string, value: any) => void;
  sortOptions?: SortOption[];
  activeSort?: string;
  onSortChange?: (sortId: string) => void;
}

export default function GlobalFilters({
  filters,
  activeFilters,
  onFilterChange,
  sortOptions = [],
  activeSort,
  onSortChange,
}: GlobalFiltersProps) {
  const [showSortDropdown, setShowSortDropdown] = useState(false);

  const activeFilterCount = Object.values(activeFilters).filter(
    (v) => v !== null && v !== undefined && v !== ""
  ).length;

  const handleClearAll = () => {
    filters.forEach((filter) => {
      onFilterChange(filter.id, null);
    });
  };

  const renderFilterInput = (filter: FilterConfig) => {
    const value = activeFilters[filter.id];

    switch (filter.type) {
      case "text":
        return (
          <motion.div
            key={filter.id}
            layout
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex items-center"
          >
            <div className="relative flex items-center bg-white/5 border border-white/10 rounded-lg px-3 py-2 hover:border-white/20 transition-colors group">
              <Search className="w-4 h-4 text-white/40 group-hover:text-white/60" />
              <input
                type="text"
                placeholder={filter.placeholder || filter.label}
                value={value || ""}
                onChange={(e) => onFilterChange(filter.id, e.target.value)}
                className="bg-transparent border-0 outline-none ml-2 text-sm text-white placeholder:text-white/30 w-32"
              />
              {value && (
                <button
                  onClick={() => onFilterChange(filter.id, null)}
                  className="ml-2 p-1 hover:bg-white/10 rounded transition-colors"
                >
                  <X className="w-3 h-3 text-white/60 hover:text-white" />
                </button>
              )}
            </div>
          </motion.div>
        );

      case "select":
        return (
          <motion.div
            key={filter.id}
            layout
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex items-center"
          >
            <div className="relative group">
              <button className="flex items-center gap-2 px-3 py-2 bg-white/5 border border-white/10 rounded-lg hover:border-white/20 text-sm text-white/80 transition-colors">
                <Filter className="w-4 h-4" />
                <span>{value ? filter.options?.find((o) => o.value === value)?.label : filter.label}</span>
                {value && (
                  <X
                    className="w-3 h-3 ml-1 cursor-pointer hover:text-white"
                    onClick={(e) => {
                      e.stopPropagation();
                      onFilterChange(filter.id, null);
                    }}
                  />
                )}
              </button>
              <div className="absolute top-full left-0 mt-1 hidden group-hover:block bg-black/90 border border-white/20 rounded-lg overflow-hidden z-50 backdrop-blur-xl min-w-max">
                {filter.options?.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => onFilterChange(filter.id, option.value)}
                    className={cn(
                      "block w-full text-left px-4 py-2 text-sm transition-colors",
                      value === option.value
                        ? "bg-white/20 text-white"
                        : "text-white/70 hover:bg-white/10"
                    )}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        );

      case "dateRange":
        return (
          <motion.div
            key={filter.id}
            layout
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex items-center gap-2"
          >
            <div className="flex items-center gap-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg hover:border-white/20 transition-colors">
              <Calendar className="w-4 h-4 text-white/40" />
              <input
                type="date"
                value={value?.start || ""}
                onChange={(e) =>
                  onFilterChange(filter.id, {
                    ...value,
                    start: e.target.value,
                  })
                }
                className="bg-transparent border-0 outline-none text-sm text-white placeholder:text-white/30"
              />
              <span className="text-white/40">-</span>
              <input
                type="date"
                value={value?.end || ""}
                onChange={(e) =>
                  onFilterChange(filter.id, {
                    ...value,
                    end: e.target.value,
                  })
                }
                className="bg-transparent border-0 outline-none text-sm text-white placeholder:text-white/30"
              />
            </div>
          </motion.div>
        );

      case "toggle":
        return (
          <motion.div
            key={filter.id}
            layout
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <button
              onClick={() => onFilterChange(filter.id, !value)}
              className={cn(
                "px-3 py-2 rounded-lg text-sm font-medium transition-colors border",
                value
                  ? "bg-white/20 border-white/30 text-white"
                  : "bg-white/5 border-white/10 text-white/60 hover:border-white/20"
              )}
            >
              {filter.label}
            </button>
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <GlassCard className="w-full p-4">
      <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-hide">
        {/* Filters */}
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <AnimatePresence mode="popLayout">
            {filters
              .filter((f) => activeFilters[f.id])
              .map((filter) => renderFilterInput(filter))}
          </AnimatePresence>
        </div>

        {/* Sort dropdown */}
        {sortOptions.length > 0 && (
          <div className="relative group flex-shrink-0">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowSortDropdown(!showSortDropdown)}
              className={cn(
                "flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors",
                activeSort
                  ? "bg-white/10 border border-white/20 text-white"
                  : "bg-white/5 border border-white/10 text-white/60 hover:border-white/20"
              )}
            >
              <ArrowUpDown className="w-4 h-4" />
              <span>Sort</span>
            </motion.button>

            <AnimatePresence>
              {showSortDropdown && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute top-full right-0 mt-2 bg-black/90 border border-white/20 rounded-lg overflow-hidden z-50 backdrop-blur-xl min-w-max shadow-lg"
                >
                  {sortOptions.map((option) => (
                    <button
                      key={option.id}
                      onClick={() => {
                        onSortChange?.(option.id);
                        setShowSortDropdown(false);
                      }}
                      className={cn(
                        "block w-full text-left px-4 py-2 text-sm transition-colors",
                        activeSort === option.id
                          ? "bg-white/20 text-white"
                          : "text-white/70 hover:bg-white/10"
                      )}
                    >
                      {option.label}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Clear all button */}
        {activeFilterCount > 0 && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={handleClearAll}
            className="flex-shrink-0 px-3 py-2 rounded-lg text-xs font-medium bg-red-500/10 border border-red-500/30 text-red-400 hover:border-red-500/60 hover:bg-red-500/20 transition-colors"
          >
            Clear ({activeFilterCount})
          </motion.button>
        )}

        {/* Add filter button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex-shrink-0 px-3 py-2 rounded-lg text-sm bg-white/10 border border-white/20 text-white/80 hover:border-white/40 hover:bg-white/20 transition-colors"
        >
          <span className="text-lg">+</span>
        </motion.button>
      </div>
    </GlassCard>
  );
}

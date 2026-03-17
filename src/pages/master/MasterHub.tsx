import { useState, useCallback, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import MasterPageShell from "@/components/platform/MasterPageShell";
import RadarPage from "./RadarPage";
import NetworkPage from "./NetworkPage";
import CockpitMasterPage from "./CockpitMasterPage";
import LaunchPage from "./LaunchPage";
import ControlPage from "./ControlPage";

const PAGES = ["radar", "network", "cockpit", "launch", "control"] as const;
type PageId = (typeof PAGES)[number];

const PAGE_COMPONENTS: Record<PageId, React.FC> = {
  radar: RadarPage,
  network: NetworkPage,
  cockpit: CockpitMasterPage,
  launch: LaunchPage,
  control: ControlPage,
};

export default function MasterHub() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialPage = (searchParams.get("page") as PageId) || "radar";
  const [activePage, setActivePage] = useState<PageId>(
    PAGES.includes(initialPage) ? initialPage : "radar"
  );

  const handlePageChange = useCallback(
    (page: string) => {
      const p = page as PageId;
      if (PAGES.includes(p)) {
        setActivePage(p);
        setSearchParams({ page: p }, { replace: true });
      }
    },
    [setSearchParams]
  );

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.altKey && e.key >= "1" && e.key <= "5") {
        e.preventDefault();
        handlePageChange(PAGES[parseInt(e.key) - 1]);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [handlePageChange]);

  const ActiveComponent = PAGE_COMPONENTS[activePage];

  return (
    <MasterPageShell activePage={activePage} onPageChange={handlePageChange}>
      <AnimatePresence mode="wait">
        <motion.div
          key={activePage}
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="h-full w-full"
        >
          <ActiveComponent />
        </motion.div>
      </AnimatePresence>
    </MasterPageShell>
  );
}

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  MapPin,
  Briefcase,
  TrendingUp,
  Globe,
  Users,
  Zap,
  AlertCircle,
  BarChart3,
  Network,
  Mail,
  Phone,
  LinkedinIcon,
  ExternalLink,
} from "lucide-react";
import {
  CarouselEngine,
  GlassCard,
  WowBackground,
  GlobalFilters,
} from "@/components/platform";
import { cn } from "@/lib/utils";

// Mock data for partners
const MOCK_PARTNERS = [
  {
    id: "1",
    name: "DHL Global Forwarding",
    country: "DE",
    city: "Bonn",
    flag: "🇩🇪",
    score: 94,
    routes: 156,
    specialties: ["Air Freight", "Ocean Freight", "Customs"],
    logo: "DF",
  },
  {
    id: "2",
    name: "Kuehne+Nagel",
    country: "CH",
    city: "Zurich",
    flag: "🇨🇭",
    score: 91,
    routes: 203,
    specialties: ["Logistics", "Contract Logistics", "Road Transport"],
    logo: "KN",
  },
  {
    id: "3",
    name: "DB Schenker",
    country: "DE",
    city: "Frankfurt",
    flag: "🇩🇪",
    score: 88,
    routes: 189,
    specialties: ["Rail Transport", "Multimodal", "Cold Chain"],
    logo: "DB",
  },
  {
    id: "4",
    name: "Geodis",
    country: "FR",
    city: "Lyon",
    flag: "🇫🇷",
    score: 86,
    routes: 142,
    specialties: ["Supply Chain", "Warehousing", "Distribution"],
    logo: "GD",
  },
  {
    id: "5",
    name: "Hellmann Worldwide",
    country: "DE",
    city: "Osnabrück",
    flag: "🇩🇪",
    score: 84,
    routes: 128,
    specialties: ["Project Cargo", "Heavy Lift", "Specialized"],
    logo: "HW",
  },
  {
    id: "6",
    name: "Agility",
    country: "AE",
    city: "Dubai",
    flag: "🇦🇪",
    score: 89,
    routes: 167,
    specialties: ["Middle East", "Asia Routes", "Customs"],
    logo: "AG",
  },
  {
    id: "7",
    name: "XPO Logistics",
    country: "US",
    city: "Greenwich",
    flag: "🇺🇸",
    score: 87,
    routes: 198,
    specialties: ["US Domestic", "LTL", "TMS"],
    logo: "XP",
  },
  {
    id: "8",
    name: "J.P. Morgan Logistics",
    country: "UK",
    city: "London",
    flag: "🇬🇧",
    score: 92,
    routes: 176,
    specialties: ["Financial Logistics", "Secure Transport", "Europe"],
    logo: "JP",
  },
];

const RECENT_SEARCHES = [
  "Ocean freight Europe",
  "Air cargo Asia",
  "Cold chain logistics",
  "Heavy lift specialists",
];

const COUNTRIES = [
  { label: "Germany", value: "DE" },
  { label: "France", value: "FR" },
  { label: "Switzerland", value: "CH" },
  { label: "United States", value: "US" },
  { label: "United Kingdom", value: "UK" },
];

const SPECIALTIES = [
  { label: "Air Freight", value: "air" },
  { label: "Ocean Freight", value: "ocean" },
  { label: "Cold Chain", value: "cold" },
  { label: "Project Cargo", value: "project" },
  { label: "Customs", value: "customs" },
];

interface DeepSearchModule {
  id: string;
  label: string;
  icon: React.ReactNode;
  enabled: boolean;
  advanced?: boolean;
  data?: Record<string, any>;
}

export default function RadarPage() {
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPartner, setSelectedPartner] = useState<string | null>(null);
  const [filters, setFilters] = useState<Record<string, any>>({
    country: null,
    specialty: null,
  });

  const [deepSearchModules, setDeepSearchModules] = useState<DeepSearchModule[]>([
    {
      id: "company-info",
      label: "Company Info",
      icon: <Briefcase className="w-4 h-4" />,
      enabled: true,
      data: {
        employees: "15,000+",
        founded: "1969",
        headquarters: "Bonn, Germany",
        public: true,
      },
    },
    {
      id: "contact-details",
      label: "Contact Details",
      icon: <Mail className="w-4 h-4" />,
      enabled: true,
      data: {
        phone: "+49 228 123 4567",
        email: "sales@partner.com",
        website: "www.partner.com",
      },
    },
    {
      id: "financial-data",
      label: "Financial Data",
      icon: <TrendingUp className="w-4 h-4" />,
      enabled: true,
      data: {
        revenue: "$15.2B",
        growth: "+8.3%",
        profitability: "High",
        debt: "Moderate",
      },
    },
    {
      id: "industry-analysis",
      label: "Industry Analysis",
      icon: <BarChart3 className="w-4 h-4" />,
      enabled: true,
      data: {
        marketShare: "3.2%",
        rank: "3rd in Europe",
        trend: "Stable",
      },
    },
    {
      id: "social-media",
      label: "Social Media",
      icon: <Network className="w-4 h-4" />,
      enabled: true,
      data: {
        linkedin: "45K followers",
        twitter: "12K followers",
        sentiment: "Positive",
      },
    },
    {
      id: "legal-records",
      label: "Legal Records",
      icon: <AlertCircle className="w-4 h-4" />,
      enabled: false,
      advanced: true,
      data: {
        lawsuits: "None",
        compliance: "ISO certified",
        certifications: "IATA, IOSH",
      },
    },
    {
      id: "patent-search",
      label: "Patent Search",
      icon: <Zap className="w-4 h-4" />,
      enabled: false,
      advanced: true,
      data: {
        patents: "12 active",
        latestFiling: "2024",
        focus: "Logistics automation",
      },
    },
    {
      id: "news-monitoring",
      label: "News Monitoring",
      icon: <TrendingUp className="w-4 h-4" />,
      enabled: false,
      advanced: true,
      data: {
        recent: "3 articles this week",
        sentiment: "Mixed",
        keywords: "Expansion, Partnership, Acquisition",
      },
    },
    {
      id: "competitor-analysis",
      label: "Competitor Analysis",
      icon: <Users className="w-4 h-4" />,
      enabled: false,
      advanced: true,
      data: {
        mainCompetitors: "UPS, FedEx, DB Schenker",
        marketPosition: "Strong",
        threats: "Low cost carriers",
      },
    },
    {
      id: "supply-chain",
      label: "Supply Chain",
      icon: <Network className="w-4 h-4" />,
      enabled: false,
      advanced: true,
      data: {
        suppliers: "200+",
        networkSize: "1,200+ locations",
        reliability: "99.2%",
      },
    },
  ]);

  const filteredPartners = useMemo(() => {
    return MOCK_PARTNERS.filter((partner) => {
      const matchesQuery =
        searchQuery === "" ||
        partner.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        partner.specialties.some((s) =>
          s.toLowerCase().includes(searchQuery.toLowerCase())
        );

      const matchesCountry = !filters.country || partner.country === filters.country;
      const matchesSpecialty =
        !filters.specialty ||
        partner.specialties.some((s) =>
          s.toLowerCase().includes(filters.specialty.toLowerCase())
        );

      return matchesQuery && matchesCountry && matchesSpecialty;
    });
  }, [searchQuery, filters]);

  const selectedPartnerData = selectedPartner
    ? MOCK_PARTNERS.find((p) => p.id === selectedPartner)
    : null;

  const toggleDeepSearchModule = (id: string) => {
    setDeepSearchModules((prev) =>
      prev.map((module) =>
        module.id === id ? { ...module, enabled: !module.enabled } : module
      )
    );
  };

  // Canvas 1: Ricerca
  const Canvas1 = () => (
    <div className="relative w-full h-full flex flex-col" style={{ height: '100%' }}>
      <WowBackground variant="radar" intensity="high" />

      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-6">
        {/* Main search header */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl font-bold text-white mb-2">Ricerca</h1>
          <p className="text-white/50 text-lg">Search. Discover. Intelligence.</p>
        </motion.div>

        {/* Search input */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="w-full max-w-2xl mb-8"
        >
          <GlassCard variant="interactive" glowColor="red" className="p-0">
            <div className="relative">
              <div className="flex items-center gap-3 px-6 py-4">
                <Search className="w-5 h-5 text-white/60" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search for partners, companies, routes..."
                  className="flex-1 bg-transparent border-0 outline-none text-white/90 placeholder:text-white/40 text-lg"
                />
              </div>

              {/* Pulsing border effect */}
              <motion.div
                className="absolute inset-0 rounded-xl pointer-events-none"
                animate={{
                  boxShadow: [
                    "inset 0 0 20px rgba(255, 100, 100, 0.2)",
                    "inset 0 0 30px rgba(255, 100, 100, 0.4)",
                    "inset 0 0 20px rgba(255, 100, 100, 0.2)",
                  ],
                }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </div>
          </GlassCard>
        </motion.div>

        {/* Filter chips */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-8 w-full max-w-2xl"
        >
          <div className="flex flex-wrap gap-3 mb-4 justify-center">
            {COUNTRIES.map((country) => (
              <motion.button
                key={country.value}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() =>
                  setFilters((f) => ({
                    ...f,
                    country: f.country === country.value ? null : country.value,
                  }))
                }
                className={cn(
                  "px-4 py-2 rounded-full text-sm font-medium border transition-all",
                  filters.country === country.value
                    ? "bg-white/20 border-white/40 text-white"
                    : "bg-white/5 border-white/10 text-white/70 hover:border-white/20"
                )}
              >
                {country.label}
              </motion.button>
            ))}
          </div>

          <div className="flex flex-wrap gap-3 justify-center">
            {SPECIALTIES.map((specialty) => (
              <motion.button
                key={specialty.value}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() =>
                  setFilters((f) => ({
                    ...f,
                    specialty:
                      f.specialty === specialty.value ? null : specialty.value,
                  }))
                }
                className={cn(
                  "px-4 py-2 rounded-full text-sm font-medium border transition-all",
                  filters.specialty === specialty.value
                    ? "bg-white/20 border-white/40 text-white"
                    : "bg-white/5 border-white/10 text-white/70 hover:border-white/20"
                )}
              >
                {specialty.label}
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Recent searches */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="w-full max-w-2xl text-center"
        >
          <p className="text-white/40 text-sm mb-3">Recent searches</p>
          <div className="flex flex-wrap gap-2 justify-center">
            {RECENT_SEARCHES.map((search) => (
              <button
                key={search}
                onClick={() => setSearchQuery(search)}
                className="px-3 py-1 rounded-full text-xs bg-white/5 border border-white/10 text-white/60 hover:border-white/20 hover:text-white/80 transition-all"
              >
                {search}
              </button>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );

  // Canvas 2: Risultati
  const Canvas2 = () => (
    <div className="relative w-full h-full flex flex-col" style={{ height: '100%' }}>
      <WowBackground variant="radar" intensity="medium" />

      <div className="relative z-10 flex flex-col h-full p-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-6"
        >
          <h2 className="text-3xl font-bold text-white mb-2">Risultati</h2>
          <p className="text-white/50">
            Found {filteredPartners.length} partners matching your criteria
          </p>
        </motion.div>

        {/* Results grid */}
        <div className="flex-1 overflow-y-auto pr-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <AnimatePresence>
              {filteredPartners.map((partner, index) => (
                <motion.div
                  key={partner.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: index * 0.08, duration: 0.5, ease: [0.32, 0.72, 0, 1] }}
                  onClick={() => {
                    setSelectedPartner(partner.id);
                    setCarouselIndex(2);
                  }}
                >
                  <GlassCard
                    variant="interactive"
                    glowColor="blue"
                    className="p-4 cursor-pointer h-full"
                  >
                    <div className="flex flex-col h-full">
                      {/* Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm">
                            {partner.logo}
                          </div>
                          <div>
                            <h3 className="text-sm font-semibold text-white">
                              {partner.name}
                            </h3>
                            <p className="text-xs text-white/60 flex items-center gap-1">
                              {partner.flag} {partner.city}
                            </p>
                          </div>
                        </div>

                        {/* Score badge */}
                        <div className="px-2 py-1 rounded-lg bg-white/10 border border-white/20">
                          <p className="text-xs font-bold text-white">
                            {partner.score}%
                          </p>
                        </div>
                      </div>

                      {/* Stats */}
                      <div className="flex gap-3 mb-4 text-xs">
                        <div className="flex items-center gap-1 text-white/60">
                          <Globe className="w-3 h-3" />
                          <span>{partner.routes} routes</span>
                        </div>
                      </div>

                      {/* Specialties */}
                      <div className="flex flex-wrap gap-2">
                        {partner.specialties.map((specialty) => (
                          <span
                            key={specialty}
                            className="px-2 py-1 rounded text-xs bg-white/10 border border-white/20 text-white/80"
                          >
                            {specialty}
                          </span>
                        ))}
                      </div>

                      <div className="flex-1" />

                      {/* CTA */}
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        className="mt-4 w-full py-2 rounded-lg bg-white/10 border border-white/20 text-white text-xs font-medium hover:bg-white/20 transition-colors"
                      >
                        View Details
                      </motion.button>
                    </div>
                  </GlassCard>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );

  // Canvas 3: Deep Search
  const Canvas3 = () => (
    <div className="relative w-full h-full flex flex-col" style={{ height: '100%' }}>
      <WowBackground variant="radar" intensity="medium" />

      <div className="relative z-10 flex flex-col h-full p-6">
        {/* Header with partner info */}
        {selectedPartnerData && (
          <>
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 pb-6 border-b border-white/10"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-lg">
                  {selectedPartnerData.logo}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">
                    {selectedPartnerData.name}
                  </h2>
                  <p className="text-white/60">
                    {selectedPartnerData.flag} {selectedPartnerData.city}, Deep Analysis
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Deep search modules */}
            <div className="mb-6">
              <p className="text-sm text-white/50 mb-3 uppercase tracking-wider">
                Search Modules
              </p>

              {/* Default modules */}
              <div className="space-y-2 mb-4">
                <p className="text-xs text-white/40">Default</p>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
                  {deepSearchModules
                    .filter((m) => !m.advanced)
                    .map((module) => (
                      <motion.button
                        key={module.id}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => toggleDeepSearchModule(module.id)}
                        className={cn(
                          "px-3 py-2 rounded-lg text-xs font-medium border transition-all flex flex-col items-center gap-2",
                          module.enabled
                            ? "bg-white/15 border-white/30 text-white"
                            : "bg-white/5 border-white/10 text-white/50"
                        )}
                      >
                        <div className="text-lg">{module.icon}</div>
                        <span>{module.label}</span>
                      </motion.button>
                    ))}
                </div>
              </div>

              {/* Advanced modules */}
              <div className="space-y-2">
                <p className="text-xs text-white/40">Advanced</p>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
                  {deepSearchModules
                    .filter((m) => m.advanced)
                    .map((module) => (
                      <motion.button
                        key={module.id}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => toggleDeepSearchModule(module.id)}
                        className={cn(
                          "px-3 py-2 rounded-lg text-xs font-medium border transition-all flex flex-col items-center gap-2",
                          module.enabled
                            ? "bg-purple-500/20 border-purple-500/50 text-white"
                            : "bg-white/5 border-white/10 text-white/50"
                        )}
                      >
                        <div className="text-lg">{module.icon}</div>
                        <span>{module.label}</span>
                      </motion.button>
                    ))}
                </div>
              </div>
            </div>

            {/* Results from active modules */}
            <div className="flex-1 overflow-y-auto pr-4 space-y-4">
              {deepSearchModules
                .filter((m) => m.enabled && m.data)
                .map((module) => (
                  <motion.div
                    key={module.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5 }}
                  >
                    <GlassCard className="p-4">
                      <div className="flex items-center gap-2 mb-3">
                        {module.icon}
                        <h4 className="text-sm font-semibold text-white">
                          {module.label}
                        </h4>
                      </div>

                      <div className="space-y-2">
                        {Object.entries(module.data || {}).map(([key, value]) => (
                          <div
                            key={key}
                            className="flex justify-between text-xs text-white/70"
                          >
                            <span className="text-white/50 capitalize">
                              {key.replace(/([A-Z])/g, " $1")}:
                            </span>
                            <span className="text-white font-medium">{String(value)}</span>
                          </div>
                        ))}
                      </div>
                    </GlassCard>
                  </motion.div>
                ))}
            </div>

            {/* AI Analysis */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="mt-6 pt-6 border-t border-white/10"
            >
              <GlassCard variant="highlighted" glowColor="purple" className="p-4">
                <div className="flex items-start gap-3">
                  <Zap className="w-4 h-4 text-purple-400 flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="text-sm font-semibold text-white mb-2">
                      AI Analysis
                    </h4>
                    <p className="text-xs text-white/70 leading-relaxed">
                      {selectedPartnerData.name} is a strong tier-1 partner with
                      excellent global coverage and {selectedPartnerData.routes} active
                      routes. Specializing in {selectedPartnerData.specialties.join(", ")},
                      they demonstrate high operational reliability. Recommended for
                      mission-critical shipments.
                    </p>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          </>
        )}

        {!selectedPartnerData && (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <AlertCircle className="w-12 h-12 text-white/30 mx-auto mb-4" />
              <p className="text-white/50">Select a partner to view deep analysis</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="w-full h-full flex flex-col relative overflow-hidden bg-black">
      {/* Main carousel */}
      <CarouselEngine
        currentIndex={carouselIndex}
        onIndexChange={setCarouselIndex}
        labels={["Ricerca", "Risultati", "Deep Search"]}
      >
        <Canvas1 />
        <Canvas2 />
        <Canvas3 />
      </CarouselEngine>
    </div>
  );
}

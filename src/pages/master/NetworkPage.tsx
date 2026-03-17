import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  Globe,
  MapPin,
  Building2,
  TrendingUp,
  Star,
  Navigation,
  Mail,
  Phone,
  Download,
  Share2,
  MessageSquare,
} from "lucide-react";
import {
  CarouselEngine,
  GlassCard,
  ListDetailView,
  WowBackground,
} from "@/components/platform";
import PartnerGlobe from "@/components/platform/PartnerGlobe";
import { cn } from "@/lib/utils";

// Mock partner data
const MOCK_PARTNERS = [
  {
    id: "1",
    name: "DHL Global Forwarding",
    logo: "DF",
    country: "Germany",
    countryCode: "DE",
    flag: "🇩🇪",
    score: 94,
    rating: 4.8,
    routes: 156,
    employees: 15000,
    branches: 89,
    yearsActive: 55,
    headquarters: "Bonn",
    locations: [
      { lat: 50.735, lng: 7.1, label: "Bonn HQ", isHQ: true },
      { lat: 52.52, lng: 13.405, label: "Berlin" },
      { lat: 48.135, lng: 11.582, label: "Munich" },
      { lat: 50.1109, lng: 8.6821, label: "Frankfurt" },
    ],
    specialties: ["Air Freight", "Ocean Freight", "Customs", "E-Commerce"],
    contacts: [
      { name: "Andreas Mueller", title: "VP Sales", email: "a.mueller@dhl.com" },
      { name: "Sofia Chen", title: "Regional Manager", email: "s.chen@dhl.com" },
    ],
  },
  {
    id: "2",
    name: "Kuehne+Nagel",
    logo: "KN",
    country: "Switzerland",
    countryCode: "CH",
    flag: "🇨🇭",
    score: 91,
    rating: 4.7,
    routes: 203,
    employees: 82000,
    branches: 256,
    yearsActive: 130,
    headquarters: "Zurich",
    locations: [
      { lat: 47.3769, lng: 8.5474, label: "Zurich HQ", isHQ: true },
      { lat: 46.948, lng: 7.447, label: "Bern" },
      { lat: 45.1895, lng: 5.7245, label: "Geneva" },
    ],
    specialties: ["Logistics", "Contract Logistics", "Road Transport", "Sea Freight"],
    contacts: [
      { name: "Klaus Weber", title: "Global Account Manager", email: "k.weber@kuhn.com" },
      { name: "Marie Dubois", title: "Operations Director", email: "m.dubois@kuhn.com" },
    ],
  },
  {
    id: "3",
    name: "DB Schenker",
    logo: "DB",
    country: "Germany",
    countryCode: "DE",
    flag: "🇩🇪",
    score: 88,
    rating: 4.6,
    routes: 189,
    employees: 74000,
    branches: 204,
    yearsActive: 45,
    headquarters: "Frankfurt",
    locations: [
      { lat: 50.1109, lng: 8.6821, label: "Frankfurt HQ", isHQ: true },
      { lat: 52.52, lng: 13.405, label: "Berlin" },
      { lat: 48.1351, lng: 11.582, label: "Munich" },
      { lat: 51.45, lng: 7.0116, label: "Essen" },
    ],
    specialties: ["Rail Transport", "Multimodal", "Cold Chain", "Special Services"],
    contacts: [
      { name: "Hans Mueller", title: "Business Director", email: "h.mueller@dbschenker.com" },
    ],
  },
  {
    id: "4",
    name: "Geodis",
    logo: "GD",
    country: "France",
    countryCode: "FR",
    flag: "🇫🇷",
    score: 86,
    rating: 4.5,
    routes: 142,
    employees: 37000,
    branches: 162,
    yearsActive: 50,
    headquarters: "Lyon",
    locations: [
      { lat: 45.7597, lng: 4.8422, label: "Lyon HQ", isHQ: true },
      { lat: 48.8566, lng: 2.3522, label: "Paris" },
      { lat: 43.6047, lng: 1.4422, label: "Toulouse" },
    ],
    specialties: ["Supply Chain", "Warehousing", "Distribution", "Reverse Logistics"],
    contacts: [
      { name: "Pierre Lefebvre", title: "Regional Director", email: "p.lefebvre@geodis.com" },
    ],
  },
  {
    id: "5",
    name: "Hellmann Worldwide",
    logo: "HW",
    country: "Germany",
    countryCode: "DE",
    flag: "🇩🇪",
    score: 84,
    rating: 4.4,
    routes: 128,
    employees: 12000,
    branches: 78,
    yearsActive: 70,
    headquarters: "Osnabrück",
    locations: [
      { lat: 52.282, lng: 8.0565, label: "Osnabrück HQ", isHQ: true },
      { lat: 52.52, lng: 13.405, label: "Berlin" },
      { lat: 51.4556, lng: 7.0116, label: "Essen" },
    ],
    specialties: ["Project Cargo", "Heavy Lift", "Specialized Transport", "OOG"],
    contacts: [
      {
        name: "Thomas Weber",
        title: "Head of Special Services",
        email: "t.weber@hellmann.com",
      },
    ],
  },
  {
    id: "6",
    name: "Agility",
    logo: "AG",
    country: "United Arab Emirates",
    countryCode: "AE",
    flag: "🇦🇪",
    score: 89,
    rating: 4.6,
    routes: 167,
    employees: 24000,
    branches: 145,
    yearsActive: 35,
    headquarters: "Dubai",
    locations: [
      { lat: 25.2048, lng: 55.2708, label: "Dubai HQ", isHQ: true },
      { lat: 24.4539, lng: 54.3773, label: "Abu Dhabi" },
      { lat: 25.3548, lng: 55.4164, label: "Jebel Ali" },
    ],
    specialties: ["Middle East", "Asia Routes", "Customs", "Project Solutions"],
    contacts: [
      {
        name: "Mohammad Al-Dosari",
        title: "Regional VP",
        email: "m.aldosari@agility.com",
      },
    ],
  },
  {
    id: "7",
    name: "XPO Logistics",
    logo: "XP",
    country: "United States",
    countryCode: "US",
    flag: "🇺🇸",
    score: 87,
    rating: 4.5,
    routes: 198,
    employees: 125000,
    branches: 478,
    yearsActive: 40,
    headquarters: "Greenwich",
    locations: [
      { lat: 41.0534, lng: -73.6264, label: "Greenwich HQ", isHQ: true },
      { lat: 40.7128, lng: -74.006, label: "New York" },
      { lat: 34.0522, lng: -118.2437, label: "Los Angeles" },
      { lat: 41.8781, lng: -87.6298, label: "Chicago" },
    ],
    specialties: ["US Domestic", "LTL", "TMS", "Last-Mile"],
    contacts: [
      { name: "John Smith", title: "VP International", email: "j.smith@xpo.com" },
    ],
  },
  {
    id: "8",
    name: "J.P. Morgan Logistics",
    logo: "JP",
    country: "United Kingdom",
    countryCode: "UK",
    flag: "🇬🇧",
    score: 92,
    rating: 4.7,
    routes: 176,
    employees: 35000,
    branches: 156,
    yearsActive: 80,
    headquarters: "London",
    locations: [
      { lat: 51.5074, lng: -0.1278, label: "London HQ", isHQ: true },
      { lat: 53.4808, lng: -2.2426, label: "Manchester" },
      { lat: 52.9547, lng: -1.1581, label: "Leicester" },
    ],
    specialties: ["Financial Logistics", "Secure Transport", "Europe", "Vault Services"],
    contacts: [
      { name: "Elizabeth Brown", title: "Global Director", email: "e.brown@jpmorganlgt.com" },
    ],
  },
];

export default function NetworkPage() {
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [selectedPartnerId, setSelectedPartnerId] = useState<string | null>(null);
  const [selectedComparisonPartners, setSelectedComparisonPartners] = useState<
    string[]
  >([]);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredPartners = useMemo(() => {
    return MOCK_PARTNERS.filter(
      (p) =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.country.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  const selectedPartner = selectedPartnerId
    ? MOCK_PARTNERS.find((p) => p.id === selectedPartnerId)
    : null;

  const comparisonPartners = selectedComparisonPartners
    .map((id) => MOCK_PARTNERS.find((p) => p.id === id))
    .filter(Boolean) as typeof MOCK_PARTNERS;

  // Canvas 1: Elenco Partner
  const Canvas1 = () => (
    <div className="relative w-full h-full" style={{ height: '100%' }}>
      <WowBackground variant="network" intensity="medium" />

      <div className="relative z-10 h-full">
        <ListDetailView
          items={filteredPartners}
          selectedId={selectedPartnerId}
          onSelect={setSelectedPartnerId}
          itemKeyExtractor={(item) => item.id}
          renderItem={(item, isActive) => (
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div
                  className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs",
                    isActive
                      ? "bg-blue-500 text-white"
                      : "bg-white/10 text-white/70"
                  )}
                >
                  {item.logo}
                </div>
                <div className="flex-1">
                  <p
                    className={cn(
                      "text-sm font-semibold",
                      isActive ? "text-white" : "text-white/70"
                    )}
                  >
                    {item.name}
                  </p>
                  <p className="text-xs text-white/50">{item.flag}</p>
                </div>
              </div>
              <div className="flex gap-3 text-xs text-white/50 px-11">
                <div>Score: {item.score}%</div>
                <div>Routes: {item.routes}</div>
              </div>
            </div>
          )}
          renderDetail={(item) => (
            <div>
              <h3 className="text-lg font-bold text-white mb-4">{item.name}</h3>

              {/* Quick stats */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                <GlassCard className="p-3 text-center">
                  <div className="text-xs text-white/60 mb-1">Employees</div>
                  <div className="text-lg font-bold text-white">
                    {(item.employees / 1000).toFixed(0)}K
                  </div>
                </GlassCard>
                <GlassCard className="p-3 text-center">
                  <div className="text-xs text-white/60 mb-1">Score</div>
                  <div className="text-lg font-bold text-blue-400">{item.score}%</div>
                </GlassCard>
                <GlassCard className="p-3 text-center">
                  <div className="text-xs text-white/60 mb-1">Branches</div>
                  <div className="text-lg font-bold text-white">{item.branches}</div>
                </GlassCard>
                <GlassCard className="p-3 text-center">
                  <div className="text-xs text-white/60 mb-1">Routes</div>
                  <div className="text-lg font-bold text-white">{item.routes}</div>
                </GlassCard>
              </div>

              {/* Contact button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setCarouselIndex(1)}
                className="w-full py-2 px-4 rounded-lg bg-blue-500/20 border border-blue-500/50 text-blue-400 hover:bg-blue-500/30 transition-colors text-sm font-medium"
              >
                View Full Profile
              </motion.button>
            </div>
          )}
        />
      </div>
    </div>
  );

  // Canvas 2: Scheda Partner
  const Canvas2 = () => (
    <div className="relative w-full h-full overflow-auto" style={{ height: '100%' }}>
      <WowBackground variant="network" intensity="medium" />

      <div className="relative z-10 p-8">
        {selectedPartner ? (
          <motion.div
            key={selectedPartner.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.32, 0.72, 0, 1] }}
            className="space-y-8 max-w-4xl mx-auto"
          >
            {/* Header section */}
            <GlassCard variant="highlighted" glowColor="blue" className="p-8">
              <div className="flex items-start gap-6">
                <div className="w-24 h-24 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-3xl flex-shrink-0">
                  {selectedPartner.logo}
                </div>
                <div className="flex-1">
                  <h2 className="text-3xl font-bold text-white mb-2">
                    {selectedPartner.name}
                  </h2>
                  <p className="text-white/70 mb-4">
                    {selectedPartner.flag} Based in {selectedPartner.headquarters},{" "}
                    {selectedPartner.country}
                  </p>

                  <div className="flex items-center gap-3">
                    <div className="flex gap-1">
                      {Array(5)
                        .fill(0)
                        .map((_, i) => (
                          <Star
                            key={i}
                            className={cn(
                              "w-4 h-4",
                              i < Math.floor(selectedPartner.rating)
                                ? "fill-yellow-400 text-yellow-400"
                                : "text-white/30"
                            )}
                          />
                        ))}
                    </div>
                    <span className="text-sm text-white/70">
                      {selectedPartner.rating}/5.0
                    </span>
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  onClick={() =>
                    setCarouselIndex(2)
                  }
                  className="px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white hover:bg-white/20 transition-colors text-sm font-medium"
                >
                  Compare
                </motion.button>
              </div>
            </GlassCard>

            {/* 3D Globe section */}
            <GlassCard className="p-6">
              <h3 className="text-lg font-semibold text-white mb-4">
                Global Network
              </h3>
              <PartnerGlobe
                locations={selectedPartner.locations}
                routes={selectedPartner.locations
                  .slice(0, -1)
                  .map((loc, i) => ({
                    from: [loc.lat, loc.lng] as [number, number],
                    to: [
                      selectedPartner.locations[i + 1].lat,
                      selectedPartner.locations[i + 1].lng,
                    ] as [number, number],
                  }))}
                size={300}
              />
            </GlassCard>

            {/* Key stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <GlassCard className="p-4 text-center">
                <div className="text-xs text-white/60 mb-2">Employees</div>
                <div className="text-2xl font-bold text-white">
                  {(selectedPartner.employees / 1000).toFixed(0)}K
                </div>
              </GlassCard>
              <GlassCard className="p-4 text-center">
                <div className="text-xs text-white/60 mb-2">Branches</div>
                <div className="text-2xl font-bold text-white">
                  {selectedPartner.branches}
                </div>
              </GlassCard>
              <GlassCard className="p-4 text-center">
                <div className="text-xs text-white/60 mb-2">Active Routes</div>
                <div className="text-2xl font-bold text-white">
                  {selectedPartner.routes}
                </div>
              </GlassCard>
              <GlassCard className="p-4 text-center">
                <div className="text-xs text-white/60 mb-2">Years Active</div>
                <div className="text-2xl font-bold text-white">
                  {selectedPartner.yearsActive}
                </div>
              </GlassCard>
            </div>

            {/* Tabs section */}
            <GlassCard className="p-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white">
                  Specializations
                </h3>
                <div className="flex flex-wrap gap-2">
                  {selectedPartner.specialties.map((specialty) => (
                    <span
                      key={specialty}
                      className="px-3 py-1 rounded-lg bg-blue-500/20 border border-blue-500/40 text-blue-300 text-sm"
                    >
                      {specialty}
                    </span>
                  ))}
                </div>
              </div>
            </GlassCard>

            {/* Contacts */}
            <GlassCard className="p-6">
              <h3 className="text-lg font-semibold text-white mb-4">
                Key Contacts
              </h3>
              <div className="space-y-3">
                {selectedPartner.contacts.map((contact, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-3 bg-white/5 rounded-lg">
                    <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center text-white/60 flex-shrink-0">
                      <Users className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-white text-sm">{contact.name}</p>
                      <p className="text-xs text-white/60 mb-2">{contact.title}</p>
                      <a
                        href={`mailto:${contact.email}`}
                        className="text-xs text-blue-400 hover:text-blue-300"
                      >
                        {contact.email}
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </GlassCard>

            {/* Action buttons */}
            <div className="grid grid-cols-3 gap-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                className="py-3 rounded-lg bg-white/10 border border-white/20 text-white hover:bg-white/20 transition-colors text-sm font-medium flex items-center justify-center gap-2"
              >
                <Mail className="w-4 h-4" />
                Contact
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                className="py-3 rounded-lg bg-white/10 border border-white/20 text-white hover:bg-white/20 transition-colors text-sm font-medium flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                Profile
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                className="py-3 rounded-lg bg-white/10 border border-white/20 text-white hover:bg-white/20 transition-colors text-sm font-medium flex items-center justify-center gap-2"
              >
                <Share2 className="w-4 h-4" />
                Share
              </motion.button>
            </div>
          </motion.div>
        ) : (
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <Building2 className="w-12 h-12 text-white/30 mx-auto mb-4" />
              <p className="text-white/50">Select a partner to view details</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  // Canvas 3: Analisi & Confronto
  const Canvas3 = () => (
    <div className="relative w-full h-full overflow-auto" style={{ height: '100%' }}>
      <WowBackground variant="network" intensity="medium" />

      <div className="relative z-10 p-8">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="max-w-6xl mx-auto"
        >
          <h2 className="text-3xl font-bold text-white mb-8">
            Partner Comparison
          </h2>

          {/* Partner selector */}
          <div className="mb-8">
            <p className="text-sm text-white/60 mb-3">Select 2-3 partners to compare</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {MOCK_PARTNERS.slice(0, 8).map((partner) => (
                <motion.button
                  key={partner.id}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setSelectedComparisonPartners((prev) =>
                      prev.includes(partner.id)
                        ? prev.filter((id) => id !== partner.id)
                        : [...prev, partner.id].slice(-3)
                    );
                  }}
                  className={cn(
                    "p-3 rounded-lg border transition-all text-sm font-medium",
                    selectedComparisonPartners.includes(partner.id)
                      ? "bg-blue-500/20 border-blue-500/50 text-white"
                      : "bg-white/5 border-white/10 text-white/70 hover:border-white/20"
                  )}
                >
                  {partner.logo} {partner.name.split(" ")[0]}
                </motion.button>
              ))}
            </div>
          </div>

          {comparisonPartners.length > 0 && (
            <>
              {/* Comparison table */}
              <GlassCard className="p-6 mb-8 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-left py-3 px-4 text-white/60 font-semibold">
                        Metric
                      </th>
                      {comparisonPartners.map((p) => (
                        <th key={p.id} className="text-left py-3 px-4 text-white font-semibold">
                          {p.logo}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="space-y-1">
                    {[
                      { label: "Score", key: "score", suffix: "%" },
                      { label: "Rating", key: "rating", suffix: "/5" },
                      { label: "Routes", key: "routes", suffix: "" },
                      { label: "Employees", key: "employees", suffix: "" },
                      { label: "Branches", key: "branches", suffix: "" },
                      { label: "Years Active", key: "yearsActive", suffix: "" },
                    ].map((metric) => (
                      <tr key={metric.key} className="border-b border-white/5">
                        <td className="py-3 px-4 text-white/70">{metric.label}</td>
                        {comparisonPartners.map((p) => (
                          <td key={p.id} className="py-3 px-4 text-white font-medium">
                            {(p as any)[metric.key]}
                            {metric.suffix}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </GlassCard>

              {/* Strengths & weaknesses */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {comparisonPartners.map((partner) => (
                  <GlassCard key={partner.id} className="p-4">
                    <h4 className="font-semibold text-white mb-3 text-sm">
                      {partner.name}
                    </h4>

                    <div className="mb-4">
                      <p className="text-xs text-green-400 font-semibold mb-2">
                        Strengths
                      </p>
                      <ul className="text-xs text-white/70 space-y-1">
                        {partner.specialties.slice(0, 3).map((s) => (
                          <li key={s} className="flex items-center gap-2">
                            <span className="text-green-400">+</span> {s}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <p className="text-xs text-red-400 font-semibold mb-2">
                        Consider
                      </p>
                      <ul className="text-xs text-white/70 space-y-1">
                        <li className="flex items-center gap-2">
                          <span className="text-red-400">-</span> Regional coverage
                        </li>
                        <li className="flex items-center gap-2">
                          <span className="text-red-400">-</span> Niche services
                        </li>
                      </ul>
                    </div>
                  </GlassCard>
                ))}
              </div>

              {/* AI Recommendation */}
              <GlassCard variant="highlighted" glowColor="purple" className="p-6 mt-8">
                <div className="flex gap-4">
                  <TrendingUp className="w-5 h-5 text-purple-400 flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-semibold text-white mb-2">
                      AI Recommendation
                    </h4>
                    <p className="text-sm text-white/70">
                      Based on your comparison,{" "}
                      <span className="font-semibold text-white">
                        {comparisonPartners[0]?.name}
                      </span>{" "}
                      offers the best overall value with {comparisonPartners[0]?.score}%
                      compatibility score. Recommended for high-volume European operations
                      with multi-modal requirements.
                    </p>
                  </div>
                </div>
              </GlassCard>
            </>
          )}
        </motion.div>
      </div>
    </div>
  );

  return (
    <div className="w-full h-full flex flex-col relative overflow-hidden bg-black">
      {/* Main carousel */}
      <CarouselEngine
        currentIndex={carouselIndex}
        onIndexChange={setCarouselIndex}
        labels={["Elenco Partner", "Scheda Partner", "Analisi & Confronto"]}
      >
        <Canvas1 />
        <Canvas2 />
        <Canvas3 />
      </CarouselEngine>
    </div>
  );
}

import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { GlobalErrorBoundary } from "@/components/system/GlobalErrorBoundary";
import { RuntimeDiagnosticPanel } from "@/components/system/RuntimeDiagnosticPanel";
import { ConnectionBanner } from "@/components/system/ConnectionBanner";

// ── Lazy-loaded pages ──
const Auth = lazy(() => import("./pages/Auth"));
const Onboarding = lazy(() => import("./pages/Onboarding"));
const MasterHub = lazy(() => import("./pages/master/MasterHub"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
});

function PageFallback() {
  return <div className="min-h-screen bg-[#0a0a14]" />;
}

const App = () => (
  <GlobalErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <ConnectionBanner />
          <RuntimeDiagnosticPanel />
          <Suspense fallback={<PageFallback />}>
            <Routes>
              {/* Public routes */}
              <Route path="/auth" element={<Auth />} />
              <Route path="/onboarding" element={<Onboarding />} />

              {/* Protected: Freight Pilot Platform is the only destination */}
              <Route element={<ProtectedRoute />}>
                <Route path="/" element={<MasterHub />} />
              </Route>

              {/* Everything else redirects to platform */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </GlobalErrorBoundary>
);

export default App;

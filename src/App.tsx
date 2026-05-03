import { useEffect, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import BootLoader from "@/components/BootLoader";
import Index from "./pages/Index.tsx";
import ApplicationFormPage from "./pages/ApplicationFormPage.tsx";
import StreamersPage from "./pages/StreamersPage.tsx";
import EmsPage from "./pages/EmsPage.tsx";
import PolicePage from "./pages/PolicePage.tsx";
import OversightPage from "./pages/OversightPage.tsx";
import GangHubPage from "./pages/GangHubPage.tsx";
import GangsPage from "./pages/GangsPage.tsx";
import VipCarsPage from "./pages/VipCarsPage.tsx";
import JusticePage from "./pages/JusticePage.tsx";
import DeveloperPage from "./pages/DeveloperPage.tsx";
import LawyerPage from "./pages/LawyerPage.tsx";
import ContactPage from "./pages/ContactPage.tsx";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

/** عند فتح أي مسار جديد نرجع التمرير لأعلى الصفحة */
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

const AppRoutes = () => {
  const location = useLocation();
  const [showBootLoader, setShowBootLoader] = useState(true);

  useEffect(() => {
    setShowBootLoader(true);
  }, [location.pathname]);

  return (
    <>
      <ScrollToTop />
      <AnimatePresence>
        {showBootLoader ? (
          <BootLoader key={location.pathname} onComplete={() => setShowBootLoader(false)} />
        ) : null}
      </AnimatePresence>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/apply/:role" element={<ApplicationFormPage />} />
        <Route path="/streamers" element={<StreamersPage />} />
        <Route path="/ems" element={<EmsPage />} />
        <Route path="/police" element={<PolicePage />} />
        <Route path="/oversight" element={<OversightPage />} />
        <Route path="/gang-vip" element={<GangHubPage />} />
        <Route path="/gangs" element={<GangsPage />} />
        <Route path="/vip-cars" element={<VipCarsPage />} />
        <Route path="/justice" element={<JusticePage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/developer" element={<DeveloperPage />} />
        <Route path="/lawyer" element={<LawyerPage />} />
        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
};

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;

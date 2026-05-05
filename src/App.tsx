import { useEffect, useState } from "react";
import { BrowserRouter, Navigate, Route, Routes, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import BootLoader from "@/components/BootLoader";
import { AuthProvider } from "@/contexts/AuthContext";
import { PublicUserProvider } from "@/contexts/PublicUserContext";
import { LawsContentProvider } from "@/contexts/LawsContentContext";
import { StreamersContentProvider } from "@/contexts/StreamersContentContext";
import { GangsContentProvider } from "@/contexts/GangsContentContext";
import { VipCarsContentProvider } from "@/contexts/VipCarsContentContext";
import { InstitutionRostersContentProvider } from "@/contexts/InstitutionRostersContentContext";
import { ApplicationsContentProvider } from "@/contexts/ApplicationsContentContext";
import { RequireStaffAuth } from "@/components/RequireStaffAuth";
import AdminLayout from "./pages/admin/AdminLayout.tsx";
import DashboardGate from "./pages/admin/DashboardGate.tsx";
import GangsEditorPage from "./pages/admin/GangsEditorPage.tsx";
import LawsEditorPage from "./pages/admin/LawsEditorPage.tsx";
import StaffUsersPage from "./pages/admin/StaffUsersPage.tsx";
import StreamersEditorPage from "./pages/admin/StreamersEditorPage.tsx";
import VipCarsEditorPage from "./pages/admin/VipCarsEditorPage.tsx";
import InstitutionRosterEditorPage from "./pages/admin/InstitutionRosterEditorPage.tsx";
import InstitutionRosterHubPage from "./pages/admin/InstitutionRosterHubPage.tsx";
import ApplicationsReviewPage from "./pages/admin/ApplicationsReviewPage.tsx";
import ActivityLogPage from "./pages/admin/ActivityLogPage.tsx";
import AboutManagerPage from "./pages/admin/AboutManagerPage.tsx";
import TicketsManagerPage from "./pages/admin/TicketsManagerPage.tsx";
import FooterManagerPage from "./pages/admin/FooterManagerPage.tsx";
import Index from "./pages/Index.tsx";
import ApplicationFormPage from "./pages/ApplicationFormPage.tsx";
import StreamersPage from "./pages/StreamersPage.tsx";
import HealthPage from "./pages/HealthPage.tsx";
import InteriorDepartmentPage from "./pages/InteriorDepartmentPage.tsx";
import OversightPage from "./pages/OversightPage.tsx";
import GangHubPage from "./pages/GangHubPage.tsx";
import GangsPage from "./pages/GangsPage.tsx";
import VipCarsPage from "./pages/VipCarsPage.tsx";
import JusticePage from "./pages/JusticePage.tsx";
import LawsPage from "./pages/LawsPage.tsx";
import DeveloperPage from "./pages/DeveloperPage.tsx";
import ContactPage from "./pages/ContactPage.tsx";
import ProfilePage from "./pages/ProfilePage.tsx";
import TicketsPage from "./pages/TicketsPage.tsx";
import NotFound from "./pages/NotFound.tsx";
import { INSTITUTION_ROSTER_STAFF_ROLES } from "@/data/institutionBranches";

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

  const skipBoot = location.pathname.startsWith("/dashboard");

  return (
    <>
      <ScrollToTop />
      <AnimatePresence>
        {showBootLoader && !skipBoot ? (
          <BootLoader key={location.pathname} onComplete={() => setShowBootLoader(false)} />
        ) : null}
      </AnimatePresence>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/apply/:role" element={<ApplicationFormPage />} />
        <Route path="/streamers" element={<StreamersPage />} />
        <Route path="/health" element={<HealthPage />} />
        <Route path="/ems" element={<Navigate to="/health" replace />} />
        <Route path="/interior" element={<Navigate to="/interior/police" replace />} />
        <Route path="/interior/:dept" element={<InteriorDepartmentPage />} />
        <Route path="/police" element={<Navigate to="/interior/police" replace />} />
        <Route path="/oversight" element={<OversightPage />} />
        <Route path="/gang-vip" element={<GangHubPage />} />
        <Route path="/gangs" element={<GangsPage />} />
        <Route path="/vip-cars" element={<VipCarsPage />} />
        <Route path="/justice" element={<JusticePage />} />
        <Route path="/laws" element={<LawsPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/tickets" element={<TicketsPage />} />
        <Route path="/developer" element={<DeveloperPage />} />
        <Route
          path="/dashboard"
          element={
            <RequireStaffAuth
              allowRoles={[
                "super_admin",
                "laws_editor",
                "streamer_manager",
                "gang_manager",
                "vip_cars_manager",
                "about_manager",
                "ticket_support_manager",
                "ticket_admin_inquiry_manager",
                "ticket_player_complaint_manager",
                "ticket_compensation_manager",
                "ticket_store_manager",
                "ticket_general_manager",
                "footer_manager",
                ...INSTITUTION_ROSTER_STAFF_ROLES,
                "application_reviewer",
              ]}
            >
              <AdminLayout />
            </RequireStaffAuth>
          }
        >
          <Route index element={<DashboardGate />} />
          <Route path="users" element={<StaffUsersPage />} />
          <Route
            path="activity"
            element={
              <RequireStaffAuth allowRoles={["super_admin"]}>
                <ActivityLogPage />
              </RequireStaffAuth>
            }
          />
          <Route
            path="laws"
            element={
              <RequireStaffAuth allowRoles={["super_admin", "laws_editor"]}>
                <LawsEditorPage />
              </RequireStaffAuth>
            }
          />
          <Route
            path="streamers"
            element={
              <RequireStaffAuth allowRoles={["super_admin", "streamer_manager"]}>
                <StreamersEditorPage />
              </RequireStaffAuth>
            }
          />
          <Route
            path="gangs"
            element={
              <RequireStaffAuth allowRoles={["super_admin", "gang_manager"]}>
                <GangsEditorPage />
              </RequireStaffAuth>
            }
          />
          <Route
            path="vip-cars"
            element={
              <RequireStaffAuth allowRoles={["super_admin", "vip_cars_manager"]}>
                <VipCarsEditorPage />
              </RequireStaffAuth>
            }
          />
          <Route
            path="institution-rosters"
            element={<Navigate to="/dashboard/institution" replace />}
          />
          <Route
            path="institution"
            element={
              <RequireStaffAuth allowRoles={["super_admin", ...INSTITUTION_ROSTER_STAFF_ROLES]}>
                <InstitutionRosterHubPage />
              </RequireStaffAuth>
            }
          />
          <Route
            path="institution/:branchId"
            element={
              <RequireStaffAuth allowRoles={["super_admin", ...INSTITUTION_ROSTER_STAFF_ROLES]}>
                <InstitutionRosterEditorPage />
              </RequireStaffAuth>
            }
          />
          <Route
            path="about"
            element={
              <RequireStaffAuth allowRoles={["super_admin", "about_manager"]}>
                <AboutManagerPage />
              </RequireStaffAuth>
            }
          />
          <Route
            path="footer"
            element={
              <RequireStaffAuth allowRoles={["super_admin", "footer_manager"]}>
                <FooterManagerPage />
              </RequireStaffAuth>
            }
          />
          <Route
            path="tickets"
            element={
              <RequireStaffAuth
                allowRoles={[
                  "super_admin",
                  "ticket_support_manager",
                  "ticket_admin_inquiry_manager",
                  "ticket_player_complaint_manager",
                  "ticket_compensation_manager",
                  "ticket_store_manager",
                  "ticket_general_manager",
                ]}
              >
                <TicketsManagerPage />
              </RequireStaffAuth>
            }
          />
          <Route
            path="tickets/:ticketType"
            element={
              <RequireStaffAuth
                allowRoles={[
                  "super_admin",
                  "ticket_support_manager",
                  "ticket_admin_inquiry_manager",
                  "ticket_player_complaint_manager",
                  "ticket_compensation_manager",
                  "ticket_store_manager",
                  "ticket_general_manager",
                ]}
              >
                <TicketsManagerPage />
              </RequireStaffAuth>
            }
          />
          <Route
            path="applications"
            element={
              <RequireStaffAuth allowRoles={["super_admin", "application_reviewer"]}>
                <ApplicationsReviewPage />
              </RequireStaffAuth>
            }
          />
        </Route>
        <Route path="/lawyer" element={<Navigate to="/justice#lawyers" replace />} />
        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
};

const App = () => {
  return (
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <PublicUserProvider>
        <AuthProvider>
          <ApplicationsContentProvider>
          <LawsContentProvider>
            <StreamersContentProvider>
              <GangsContentProvider>
              <VipCarsContentProvider>
                <InstitutionRostersContentProvider>
                  <AppRoutes />
                </InstitutionRostersContentProvider>
              </VipCarsContentProvider>
            </GangsContentProvider>
            </StreamersContentProvider>
          </LawsContentProvider>
          </ApplicationsContentProvider>
        </AuthProvider>
        </PublicUserProvider>
      </BrowserRouter>
    </TooltipProvider>
  );
};

export default App;

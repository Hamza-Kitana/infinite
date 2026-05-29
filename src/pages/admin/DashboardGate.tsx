import { Navigate } from "react-router-dom";
import { getPostLoginDashboardPath, useAuth } from "@/contexts/AuthContext";
import DashboardHomePage from "./DashboardHomePage.tsx";

/** جذر `/dashboard`: سوبر أدمِن → نظرة عامة؛ غيره → أول مسار لوحة يطابق أدواره */
const DashboardGate = () => {
  const { user, isSuperAdmin } = useAuth();

  if (isSuperAdmin || user?.isOwner) {
    return <DashboardHomePage />;
  }

  if (user?.roles?.length) {
    const dest = getPostLoginDashboardPath(user);
    if (dest !== "/dashboard") {
      return <Navigate to={dest} replace />;
    }
  }

  return <DashboardHomePage />;
};

export default DashboardGate;

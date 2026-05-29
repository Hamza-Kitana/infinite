import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

type Props = {
  children: ReactNode;
};

/** صفحات حصرية لحساب المالك المخفي */
export function RequireOwnerAuth({ children }: Props) {
  const { isOwner } = useAuth();
  if (!isOwner) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}

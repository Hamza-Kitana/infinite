import { useMemo } from "react";
import { Link, Navigate } from "react-router-dom";
import { Building2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import {
  INSTITUTION_BRANCH_IDS,
  INSTITUTION_BRANCH_META,
  institutionRosterBranchIdsFromRoleList,
} from "@/data/institutionBranches";

const InstitutionRosterHubPage = () => {
  const { user, isSuperAdmin } = useAuth();

  const branches = useMemo(() => {
    if (isSuperAdmin) return [...INSTITUTION_BRANCH_IDS];
    return institutionRosterBranchIdsFromRoleList(user?.roles ?? []);
  }, [isSuperAdmin, user?.roles]);

  if (!isSuperAdmin && branches.length === 0) {
    return <Navigate to="/dashboard" replace />;
  }

  if (!isSuperAdmin && branches.length === 1) {
    return <Navigate to={`/dashboard/institution/${branches[0]}`} replace />;
  }

  return (
    <div className="mx-auto max-w-4xl space-y-8 pb-12 text-right">
      <div>
        <h1 className="font-display text-2xl font-bold flex items-center justify-end gap-2">
          <Building2 className="h-7 w-7 text-primary" />
          طواقم المؤسسات
        </h1>
        <p className="mt-2 max-w-xl text-sm text-muted-foreground">
          اختر الفرع لفتح صفحة تحرير طاقمه (قائد، نائب، شبكة الأعضاء) — كل فرع له صفحة مستقلة.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {branches.map((id) => (
          <Link
            key={id}
            to={`/dashboard/institution/${id}`}
            className="group rounded-xl border border-primary/20 bg-card/50 p-6 text-right transition-colors hover:border-primary/40 hover:bg-primary/5"
          >
            <Building2 className="mb-3 h-8 w-8 text-primary transition-transform group-hover:scale-105" />
            <h2 className="font-display text-lg font-bold">{INSTITUTION_BRANCH_META[id].labelAr}</h2>
            <p className="mt-2 text-sm text-muted-foreground">فتح محرر الطاقم</p>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default InstitutionRosterHubPage;

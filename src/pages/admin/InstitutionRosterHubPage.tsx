import { useMemo } from "react";
import { Link, Navigate } from "react-router-dom";
import { Building2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import {
  INSTITUTION_BRANCH_IDS,
  INSTITUTION_BRANCH_META,
  institutionRosterBranchIdsFromRoleList,
} from "@/data/institutionBranches";
import { adminPageDesc, adminPageWrap, adminTitleIcon } from "@/lib/adminUi";
import { cn } from "@/lib/utils";

const CARD_THEMES = [
  {
    border: "border-slate-200/90",
    bg: "bg-white",
    iconBg: "bg-violet-100",
    iconText: "text-violet-700",
    hover: "hover:border-violet-300/60 hover:bg-violet-50/40",
  },
  {
    border: "border-slate-200/90",
    bg: "bg-white",
    iconBg: "bg-indigo-100",
    iconText: "text-indigo-700",
    hover: "hover:border-indigo-300/60 hover:bg-indigo-50/40",
  },
  {
    border: "border-slate-200/90",
    bg: "bg-white",
    iconBg: "bg-fuchsia-100",
    iconText: "text-fuchsia-700",
    hover: "hover:border-fuchsia-300/60 hover:bg-fuchsia-50/40",
  },
  {
    border: "border-slate-200/90",
    bg: "bg-white",
    iconBg: "bg-purple-100",
    iconText: "text-purple-700",
    hover: "hover:border-purple-300/60 hover:bg-purple-50/40",
  },
] as const;

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
    <div className={cn(adminPageWrap, "max-w-5xl space-y-8")}>
      <div>
        <h1 className="flex items-center justify-end gap-2 font-display text-2xl font-bold tracking-tight text-slate-900">
          <Building2 className={adminTitleIcon} />
          طواقم المؤسسات
        </h1>
        <p className={cn(adminPageDesc, "max-w-xl")}>
          اختر الفرع لفتح صفحة تحرير طاقمه (قائد، نائب، شبكة الأعضاء) — كل فرع له صفحة مستقلة.
        </p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {branches.map((id, index) => {
          const theme = CARD_THEMES[index % CARD_THEMES.length];
          return (
          <Link
            key={id}
            to={`/dashboard/institution/${id}`}
            className={`group rounded-2xl border p-5 text-right shadow-[0_4px_24px_-8px_rgba(15,23,42,0.12)] transition-colors ${theme.border} ${theme.bg} ${theme.hover}`}
          >
            <div className={`mb-2 inline-flex h-10 w-10 items-center justify-center rounded-lg ${theme.iconBg}`}>
              <Building2 className={`h-5 w-5 transition-transform group-hover:scale-105 ${theme.iconText}`} />
            </div>
            <h2 className="font-display text-base font-bold text-slate-900">{INSTITUTION_BRANCH_META[id].labelAr}</h2>
            <p className="mt-1 text-xs text-slate-600">تحرير القائد، النائب، وأعضاء الطاقم</p>
          </Link>
        )})}
      </div>
    </div>
  );
};

export default InstitutionRosterHubPage;

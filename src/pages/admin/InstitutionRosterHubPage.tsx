import { useMemo } from "react";
import { Link, Navigate } from "react-router-dom";
import { BellRing, Building2, ChevronLeft, Users } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useApplicationsContent } from "@/contexts/ApplicationsContentContext";
import {
  INSTITUTION_BRANCH_IDS,
  INSTITUTION_BRANCH_META,
  institutionRosterBranchIdsFromRoleList,
} from "@/data/institutionBranches";
import { pendingJobApplicationsCountByBranch } from "@/lib/applicationReviewAccess";
import { adminPageDesc, adminPageTitle, adminPageWrap, adminTitleIcon } from "@/lib/adminUi";
import { cn } from "@/lib/utils";

const CARD_THEMES = [
  {
    border: "border-slate-200/90",
    bg: "bg-white",
    iconBg: "bg-violet-100",
    iconText: "text-violet-700",
    hover: "hover:border-violet-300/60 hover:shadow-lg",
    darkBorder: "dark:border-slate-600/85",
    darkBg: "dark:bg-slate-800/95",
    darkIconBg: "dark:bg-violet-950/70 dark:ring-1 dark:ring-violet-500/25",
    darkIconText: "dark:text-violet-300",
    darkHover: "dark:hover:border-violet-500/45",
  },
  {
    border: "border-slate-200/90",
    bg: "bg-white",
    iconBg: "bg-indigo-100",
    iconText: "text-indigo-700",
    hover: "hover:border-indigo-300/60 hover:shadow-lg",
    darkBorder: "dark:border-slate-600/85",
    darkBg: "dark:bg-slate-800/95",
    darkIconBg: "dark:bg-indigo-950/70 dark:ring-1 dark:ring-indigo-500/25",
    darkIconText: "dark:text-indigo-300",
    darkHover: "dark:hover:border-indigo-500/45",
  },
  {
    border: "border-slate-200/90",
    bg: "bg-white",
    iconBg: "bg-fuchsia-100",
    iconText: "text-fuchsia-700",
    hover: "hover:border-fuchsia-300/60 hover:shadow-lg",
    darkBorder: "dark:border-slate-600/85",
    darkBg: "dark:bg-slate-800/95",
    darkIconBg: "dark:bg-fuchsia-950/70 dark:ring-1 dark:ring-fuchsia-500/25",
    darkIconText: "dark:text-fuchsia-300",
    darkHover: "dark:hover:border-fuchsia-500/45",
  },
  {
    border: "border-slate-200/90",
    bg: "bg-white",
    iconBg: "bg-purple-100",
    iconText: "text-purple-700",
    hover: "hover:border-purple-300/60 hover:shadow-lg",
    darkBorder: "dark:border-slate-600/85",
    darkBg: "dark:bg-slate-800/95",
    darkIconBg: "dark:bg-purple-950/70 dark:ring-1 dark:ring-purple-500/25",
    darkIconText: "dark:text-purple-300",
    darkHover: "dark:hover:border-purple-500/45",
  },
] as const;

const InstitutionRosterHubPage = () => {
  const { user, isSuperAdmin } = useAuth();
  const { applications } = useApplicationsContent();

  const branches = useMemo(() => {
    if (isSuperAdmin) return [...INSTITUTION_BRANCH_IDS];
    return institutionRosterBranchIdsFromRoleList(user?.roles ?? []);
  }, [isSuperAdmin, user?.roles]);

  const pendingByBranch = useMemo(
    () => pendingJobApplicationsCountByBranch(applications, branches),
    [applications, branches],
  );

  const totalPending = useMemo(
    () => Array.from(pendingByBranch.values()).reduce((sum, count) => sum + count, 0),
    [pendingByBranch],
  );

  if (!isSuperAdmin && branches.length === 0) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className={cn(adminPageWrap, "max-w-6xl space-y-8")}>
      <div>
        <h1 className={adminPageTitle}>
          <Building2 className={adminTitleIcon} />
          المؤسسات
        </h1>
        <p className={cn(adminPageDesc, "max-w-2xl")}>
          اختر مؤسسة لتحرير طاقم القيادة والأعضاء وطلبات التوظيف.
        </p>
        {totalPending > 0 ? (
          <p className="mt-3 inline-flex items-center gap-2 rounded-full border border-sky-200 bg-sky-50 px-3 py-1.5 text-xs font-medium text-sky-900 dark:border-sky-700/50 dark:bg-sky-950/40 dark:text-sky-100">
            <BellRing className="h-3.5 w-3.5 shrink-0" aria-hidden />
            {totalPending === 1
              ? "يوجد طلب توظيف واحد بانتظار المراجعة"
              : `يوجد ${totalPending} طلبات توظيف بانتظار المراجعة`}
          </p>
        ) : null}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {branches.map((id, index) => {
          const theme = CARD_THEMES[index % CARD_THEMES.length];
          const pendingCount = pendingByBranch.get(id) ?? 0;
          const hasPending = pendingCount > 0;

          return (
            <Link
              key={id}
              to={`/dashboard/institution/${id}`}
              className={cn(
                "group relative flex h-full flex-col rounded-2xl border p-5 text-right shadow-[0_4px_24px_-8px_rgba(15,23,42,0.12)] transition-all dark:shadow-[0_4px_24px_-8px_rgba(0,0,0,0.35)]",
                theme.border,
                theme.bg,
                theme.hover,
                theme.darkBorder,
                theme.darkBg,
                theme.darkHover,
                hasPending &&
                  "border-sky-300/90 ring-2 ring-sky-400/35 dark:border-sky-600/70 dark:ring-sky-500/25",
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div
                  className={cn(
                    "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-transform group-hover:scale-105",
                    theme.iconBg,
                    theme.darkIconBg,
                  )}
                >
                  <Users className={cn("h-5 w-5", theme.iconText, theme.darkIconText)} />
                </div>
                {hasPending ? (
                  <span
                    className="inline-flex min-w-6 items-center justify-center rounded-full bg-sky-500 px-2 py-0.5 text-[11px] font-bold text-white shadow-sm ring-2 ring-white dark:ring-slate-800"
                    title="طلبات توظيف بانتظار المراجعة"
                  >
                    {pendingCount}
                  </span>
                ) : null}
              </div>

              <h2 className="mt-4 font-display text-lg font-bold text-slate-900 dark:text-slate-50">
                {INSTITUTION_BRANCH_META[id].labelAr}
              </h2>
              <p className="mt-1 flex-1 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
                {hasPending
                  ? pendingCount === 1
                    ? "طلب توظيف جديد بانتظار مراجعتك."
                    : `${pendingCount} طلبات توظيف بانتظار مراجعتك.`
                  : "قائد، نائب، أعضاء، وطلبات التوظيف."}
              </p>

              <span
                className={cn(
                  "mt-5 inline-flex items-center justify-end gap-1 text-sm font-medium group-hover:-translate-x-0.5",
                  hasPending
                    ? "text-sky-700 group-hover:text-sky-900 dark:text-sky-300 dark:group-hover:text-sky-100"
                    : "text-violet-700 group-hover:text-violet-900 dark:text-violet-300 dark:group-hover:text-violet-100",
                )}
              >
                {hasPending ? "مراجعة الطلبات" : "تحرير الطاقم"}
                <ChevronLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default InstitutionRosterHubPage;

import { useMemo } from "react";
import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  BookOpen,
  Building2,
  Car,
  ClipboardList,
  ExternalLink,
  History,
  LayoutDashboard,
  LogOut,
  Scale,
  Shield,
  Swords,
  Users,
  Video,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { primaryStaffRole, useAuth, type StaffRole } from "@/contexts/AuthContext";
import {
  INSTITUTION_BRANCH_IDS,
  INSTITUTION_BRANCH_META,
  branchIdFromInstitutionRosterStaffRole,
  institutionRosterStaffRoleForBranch,
  isInstitutionBranchId,
  isInstitutionRosterStaffRole,
} from "@/data/institutionBranches";
import { cn } from "@/lib/utils";

type NavItem = { to: string; label: string; icon: typeof LayoutDashboard; roles: StaffRole[]; end?: boolean };

const STATIC_NAV_CORE: NavItem[] = [
  { to: "/dashboard", label: "نظرة عامة", icon: LayoutDashboard, roles: ["super_admin"], end: true },
  { to: "/dashboard/users", label: "المستخدمون والأدوار", icon: Users, roles: ["super_admin"] },
  { to: "/dashboard/activity", label: "سجل النشاط", icon: History, roles: ["super_admin"] },
  { to: "/dashboard/laws", label: "تحرير القوانين", icon: BookOpen, roles: ["super_admin", "laws_editor"] },
  { to: "/dashboard/streamers", label: "ستريمر منجر", icon: Video, roles: ["super_admin", "streamer_manager"] },
  { to: "/dashboard/gangs", label: "مدير العصابات", icon: Swords, roles: ["super_admin", "gang_manager"] },
  { to: "/dashboard/vip-cars", label: "مدير سيارات VIP", icon: Car, roles: ["super_admin", "vip_cars_manager"] },
];

const STATIC_NAV_TAIL: NavItem[] = [
  {
    to: "/dashboard/applications",
    label: "طلبات التقديم",
    icon: ClipboardList,
    roles: ["super_admin", "application_reviewer"],
  },
];

function adminRoleShell(role: StaffRole): { title: string; badge: string } {
  switch (role) {
    case "super_admin":
      return { title: "لوحة الإدارة", badge: "Super Admin" };
    case "laws_editor":
      return { title: "محرر القوانين", badge: "Laws Editor" };
    case "streamer_manager":
      return { title: "ستريمر منجر", badge: "Streamer Manager" };
    case "gang_manager":
      return { title: "مدير العصابات", badge: "Gang Manager" };
    case "vip_cars_manager":
      return { title: "مدير سيارات VIP", badge: "VIP Cars Manager" };
    case "application_reviewer":
      return { title: "مراجع التقديمات", badge: "Application Reviewer" };
    default:
      if (isInstitutionRosterStaffRole(role)) {
        const id = branchIdFromInstitutionRosterStaffRole(role);
        if (id) {
          return {
            title: `طاقم — ${INSTITUTION_BRANCH_META[id].labelAr}`,
            badge: "Roster",
          };
        }
      }
      return { title: "لوحة التحكم", badge: "Staff" };
  }
}

const AdminLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    user,
    logout,
    isSuperAdmin,
    isLawsEditor,
    isStreamerManager,
    isGangManager,
    isVipCarsManager,
    isInstitutionRosterManager,
    isApplicationReviewer,
  } = useAuth();

  const userRoles = user?.roles ?? [];

  const items = useMemo(() => {
    const instNav: NavItem[] = [];
    if (isSuperAdmin) {
      instNav.push({
        to: "/dashboard/institution",
        label: "طواقم المؤسسات",
        icon: Building2,
        roles: ["super_admin"],
        end: true,
      });
    } else {
      for (const id of INSTITUTION_BRANCH_IDS) {
        const rr = institutionRosterStaffRoleForBranch(id);
        if (userRoles.includes(rr)) {
          instNav.push({
            to: `/dashboard/institution/${id}`,
            label: INSTITUTION_BRANCH_META[id].labelAr,
            icon: Building2,
            roles: [rr],
            end: true,
          });
        }
      }
    }

    const merged = [...STATIC_NAV_CORE, ...instNav, ...STATIC_NAV_TAIL];
    return merged.filter((n) => n.roles.some((r) => userRoles.includes(r)));
  }, [userRoles, isSuperAdmin]);

  const primary = primaryStaffRole(userRoles);
  const shell = primary ? adminRoleShell(primary) : { title: "لوحة التحكم", badge: "Staff" };
  const title = shell.title;
  const badge = shell.badge;

  const pageTitle =
    location.pathname === "/dashboard"
      ? "نظرة عامة"
      : location.pathname.startsWith("/dashboard/users")
        ? "المستخدمون"
        : location.pathname.startsWith("/dashboard/activity")
          ? "سجل النشاط"
          : location.pathname.startsWith("/dashboard/laws")
            ? "تحرير القوانين"
            : location.pathname.startsWith("/dashboard/streamers")
              ? "ستريمر منجر"
              : location.pathname.startsWith("/dashboard/gangs")
                ? "مدير العصابات"
                : location.pathname.startsWith("/dashboard/vip-cars")
                  ? "مدير سيارات VIP"
                  : location.pathname === "/dashboard/institution"
                    ? "طواقم المؤسسات"
                    : location.pathname.startsWith("/dashboard/institution/")
                      ? (() => {
                          const seg = location.pathname.slice("/dashboard/institution/".length).split("/")[0];
                          return seg && isInstitutionBranchId(seg)
                            ? `طاقم — ${INSTITUTION_BRANCH_META[seg].labelAr}`
                            : "طاقم مؤسسة";
                        })()
                    : location.pathname.startsWith("/dashboard/applications")
                      ? "طلبات التقديم"
                      : "لوحة التحكم";

  const subHint =
    userRoles.length > 1
      ? `${userRoles.length} صلاحيات نشطة`
      : isLawsEditor
        ? "صلاحية قوانين"
        : isStreamerManager
          ? "صلاحية بث"
          : isGangManager
            ? "صلاحية عصابات"
            : isVipCarsManager
              ? "صلاحية سيارات VIP"
              : isInstitutionRosterManager
                ? "صلاحية طاقم مؤسسة"
                : isApplicationReviewer
                  ? "مراجعة تقديمات"
                  : "";

  return (
    <div
      dir="rtl"
      className="min-h-screen bg-gradient-to-br from-slate-100 via-slate-50 to-white text-foreground antialiased dark:from-slate-950 dark:via-slate-900 dark:to-slate-950"
    >
      <div className="flex min-h-screen flex-col lg:flex-row">
        <aside className="relative z-40 flex w-full shrink-0 flex-col border-b border-slate-200/90 bg-white/95 shadow-sm backdrop-blur-xl pt-[env(safe-area-inset-top,0px)] dark:border-slate-800 dark:bg-slate-900/95 lg:fixed lg:inset-y-0 lg:right-0 lg:w-[17.5rem] lg:border-b-0 lg:border-l lg:border-slate-200/80 dark:lg:border-slate-800">
          <div className="border-b border-slate-100 px-5 py-6 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-sky-200/80 bg-gradient-to-b from-white to-slate-50 shadow-sm ring-1 ring-sky-100/80 dark:border-sky-800/50 dark:from-slate-800 dark:to-slate-900/90 dark:ring-sky-950/40">
                <img
                  src="/INF_LOGO.png"
                  alt="Infinite City"
                  className="h-10 w-10 object-contain drop-shadow-[0_0_18px_hsl(199_89%_48%/0.35)]"
                  loading="eager"
                />
              </div>
              <div className="min-w-0 flex-1 text-right">
                <p className="font-display text-[10px] tracking-[0.32em] text-sky-600/90 dark:text-sky-400/90">INFINITE CITY</p>
                <p className="mt-1 font-display text-lg font-bold leading-tight text-slate-800 dark:text-slate-50">{title}</p>
                <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">
                  {user?.username}
                  <span className="mx-1.5 text-slate-300">·</span>
                  <span className="rounded-md bg-slate-100 px-1.5 py-0.5 font-mono text-[10px] text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                    {badge}
                  </span>
                </p>
              </div>
            </div>
          </div>
          <nav className="flex flex-1 flex-col gap-0.5 p-3">
            <span className="px-3 py-2 font-display text-[11px] font-medium uppercase tracking-wide text-slate-400">
              القائمة
            </span>
            {items.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-2.5 rounded-xl px-3 py-2.5 font-display text-sm transition-all duration-200",
                    isActive
                      ? "bg-sky-100 font-semibold text-sky-900 shadow-sm dark:bg-sky-950/60 dark:text-sky-100"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/80 dark:hover:text-slate-100",
                  )
                }
              >
                <item.icon className="h-4 w-4 shrink-0 opacity-90" />
                {item.label}
              </NavLink>
            ))}

            <div className="mt-3 space-y-2 border-t border-slate-100 pt-3 dark:border-slate-800">
              {isLawsEditor ? (
                <p className="px-3 text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">
                  <Scale className="me-1 inline h-3 w-3 text-sky-500" />
                  القوانين تتحدث للزوّار بعد الحفظ.
                </p>
              ) : null}
              {isStreamerManager ? (
                <p className="px-3 text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">
                  <Video className="me-1 inline h-3 w-3 text-sky-500" />
                  صفحة البث والصور محلياً في المتصفح.
                </p>
              ) : null}
              {isGangManager ? (
                <p className="px-3 text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">
                  <Swords className="me-1 inline h-3 w-3 text-sky-500" />
                  العصابات والشعارات محلياً.
                </p>
              ) : null}
              {isVipCarsManager ? (
                <p className="px-3 text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">
                  <Car className="me-1 inline h-3 w-3 text-sky-500" />
                  كتالوج VIP والصور محلياً.
                </p>
              ) : null}
              {isInstitutionRosterManager ? (
                <p className="px-3 text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">
                  <Building2 className="me-1 inline h-3 w-3 text-sky-500" />
                  {userRoles.filter((r) => isInstitutionRosterStaffRole(r)).length > 1
                    ? "لكل فرع صفحة منفصلة من القائمة أو من صفحة الطواقم."
                    : "تعديل طاقم الفرع المرتبط بدورك فقط."}
                </p>
              ) : null}
              {isApplicationReviewer ? (
                <p className="px-3 text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">
                  <ClipboardList className="me-1 inline h-3 w-3 text-sky-500" />
                  طلبات التقديم: قبول أو رفض.
                </p>
              ) : null}
            </div>
          </nav>
          <div className="border-t border-slate-100 p-3 space-y-0.5 dark:border-slate-800">
            <Link
              to="/"
              className="flex items-center gap-2 rounded-xl px-3 py-2 font-display text-sm text-slate-600 transition-colors hover:bg-slate-50 hover:text-sky-800 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-sky-200"
            >
              <ExternalLink className="h-4 w-4 shrink-0" />
              الموقع العام
            </Link>
          </div>
        </aside>

        <div className="flex min-h-screen min-w-0 flex-1 flex-col lg:mr-[17.5rem]">
          <header className="sticky top-0 z-30 flex items-center justify-between gap-4 border-b border-slate-200/80 bg-white/90 px-4 py-3.5 backdrop-blur-md sm:px-6 dark:border-slate-800 dark:bg-slate-900/90">
            <div className="min-w-0 text-right">
              <p className="truncate font-display text-sm font-semibold text-slate-800 dark:text-slate-100">{pageTitle}</p>
              <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                {user?.username} ·{" "}
                {isSuperAdmin ? (
                  <Shield className="inline h-3 w-3 text-sky-600 dark:text-sky-400" aria-hidden />
                ) : isStreamerManager ? (
                  <Video className="inline h-3 w-3 text-sky-600 dark:text-sky-400" aria-hidden />
                ) : isGangManager ? (
                  <Swords className="inline h-3 w-3 text-sky-600 dark:text-sky-400" aria-hidden />
                ) : isVipCarsManager ? (
                  <Car className="inline h-3 w-3 text-sky-600 dark:text-sky-400" aria-hidden />
                ) : isInstitutionRosterManager ? (
                  <Building2 className="inline h-3 w-3 text-sky-600 dark:text-sky-400" aria-hidden />
                ) : isApplicationReviewer ? (
                  <ClipboardList className="inline h-3 w-3 text-sky-600 dark:text-sky-400" aria-hidden />
                ) : (
                  <Scale className="inline h-3 w-3 text-sky-600 dark:text-sky-400" aria-hidden />
                )}{" "}
                {subHint}
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              className="shrink-0 border-slate-200 text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
              onClick={() => {
                logout();
                navigate("/", { replace: true });
              }}
            >
              <LogOut className="ms-2 h-4 w-4" />
              خروج
            </Button>
          </header>

          <main className="flex-1 px-4 py-8 sm:px-6 lg:px-10">
            <div className="mx-auto max-w-[1400px]">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;

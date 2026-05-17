import { useEffect, useLayoutEffect, useMemo, useState } from "react";
import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  BookOpen,
  Building2,
  Car,
  ChevronDown,
  ClipboardList,
  ExternalLink,
  Footprints,
  History,
  Home,
  Info,
  Layers,
  LayoutDashboard,
  LogOut,
  MessageSquareMore,
  Package,
  Scale,
  ShoppingBag,
  ShieldQuestion,
  Store,
  Swords,
  TrendingUp,
  Users,
  Video,
  Moon,
  Sun,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { primaryStaffRole, useAuth, type StaffRole } from "@/contexts/AuthContext";
import {
  INSTITUTION_BRANCH_IDS,
  INSTITUTION_BRANCH_META,
  INSTITUTION_ROSTER_STAFF_ROLES,
  branchIdFromInstitutionRosterStaffRole,
  institutionRosterStaffRoleForBranch,
  isInstitutionBranchId,
  isInstitutionRosterStaffRole,
} from "@/data/institutionBranches";
import { cn } from "@/lib/utils";
import { useApplicationsContent } from "@/contexts/ApplicationsContentContext";
import {
  countPendingJobApplicationsForStaff,
  countPendingServerApplicationsForStaff,
} from "@/lib/applicationReviewAccess";
import { countPendingStreamerApplications } from "@/lib/streamerApplication";
import { useTicketsCenter, type TicketTypeRole } from "@/lib/ticketsCenter";
import { persistAdminDashboardTheme, readAdminDashboardTheme, type AdminDashboardTheme } from "@/lib/adminDashboardTheme";
import "@/styles/admin-dashboard.css";

type NavItem = { to: string; label: string; icon: typeof LayoutDashboard; roles: StaffRole[]; end?: boolean };

/** روابط إدارة المتجر — تُعرض تحت عنوان «المتجر» في الشريط الجانبي */
const STORE_SIDEBAR_NAV: NavItem[] = [
  { to: "/dashboard/vip-cars", label: "سيارات VIP", icon: Car, roles: ["super_admin", "vip_cars_manager"] },
  { to: "/dashboard/houses", label: "البيوت", icon: Home, roles: ["super_admin", "houses_manager"] },
  { to: "/dashboard/packages", label: "البكجات", icon: Package, roles: ["super_admin", "packages_manager"] },
  { to: "/dashboard/investments", label: "الاستثمار", icon: TrendingUp, roles: ["super_admin", "investments_manager"] },
  {
    to: "/dashboard/store-orders",
    label: "طلبات المتاجر",
    icon: ShoppingBag,
    roles: ["super_admin", "store_orders_manager"],
  },
];

const STORE_SIDEBAR_PREFIXES = [
  "/dashboard/vip-cars",
  "/dashboard/houses",
  "/dashboard/packages",
  "/dashboard/investments",
  "/dashboard/store-orders",
] as const;

const STATIC_NAV_LEADING: NavItem[] = [
  { to: "/dashboard", label: "نظرة عامة", icon: LayoutDashboard, roles: ["super_admin"], end: true },
  { to: "/dashboard/users", label: "المستخدمون والأدوار", icon: Users, roles: ["super_admin"] },
  { to: "/dashboard/role-groups", label: "مجموعات الرتب", icon: Layers, roles: ["super_admin"] },
  { to: "/dashboard/activity", label: "سجل النشاط", icon: History, roles: ["super_admin"] },
  { to: "/dashboard/laws", label: "تحرير القوانين", icon: BookOpen, roles: ["super_admin", "laws_editor"] },
  { to: "/dashboard/quiz", label: "أسئلة التقديم", icon: ShieldQuestion, roles: ["super_admin", "quiz_manager"] },
  { to: "/dashboard/streamers", label: "ستريمر منجر", icon: Video, roles: ["super_admin", "streamer_manager"] },
  { to: "/dashboard/gangs", label: "مدير العصابات", icon: Swords, roles: ["super_admin", "gang_manager"] },
];

const STATIC_NAV_TRAILING: NavItem[] = [
  { to: "/dashboard/about", label: "مدير من نحن", icon: Info, roles: ["super_admin", "about_manager"] },
  { to: "/dashboard/footer", label: "مدير الفوتر", icon: Footprints, roles: ["super_admin", "footer_manager"] },
  {
    to: "/dashboard/tickets",
    label: "التكت",
    icon: MessageSquareMore,
    roles: [
      "super_admin",
      "ticket_support_manager",
      "ticket_admin_inquiry_manager",
      "ticket_player_complaint_manager",
      "ticket_compensation_manager",
      "ticket_store_manager",
      "ticket_general_manager",
    ],
  },
];

const STATIC_NAV_TAIL: NavItem[] = [
  {
    to: "/dashboard/applications",
    label: "طلبات التقديم",
    icon: ClipboardList,
    roles: ["super_admin", "application_reviewer", "streamer_manager", ...INSTITUTION_ROSTER_STAFF_ROLES],
  },
];

const TICKET_TYPE_NAV: { slug: string; label: string; role: TicketTypeRole & StaffRole }[] = [
  { slug: "support", label: "دعم فني", role: "ticket_support_manager" },
  { slug: "admin-inquiry", label: "استفسار إداري", role: "ticket_admin_inquiry_manager" },
  { slug: "player-complaint", label: "شكوى لاعب", role: "ticket_player_complaint_manager" },
  { slug: "compensation", label: "طلب تعويض", role: "ticket_compensation_manager" },
  { slug: "store", label: "طلب متجر", role: "ticket_store_manager" },
  { slug: "general", label: "تكت عام", role: "ticket_general_manager" },
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
    case "houses_manager":
      return { title: "مدير البيوت", badge: "Houses Manager" };
    case "packages_manager":
      return { title: "مدير البكجات", badge: "Packages Manager" };
    case "investments_manager":
      return { title: "مدير الاستثمار", badge: "Investments Manager" };
    case "quiz_manager":
      return { title: "مدير الأسئلة", badge: "Quiz Manager" };
    case "application_reviewer":
      return { title: "مراجع التقديمات", badge: "Application Reviewer" };
    case "about_manager":
      return { title: "مدير من نحن", badge: "About Manager" };
    case "store_orders_manager":
      return { title: "طلبات المتاجر", badge: "Store Orders" };
    case "ticket_support_manager":
    case "ticket_admin_inquiry_manager":
    case "ticket_player_complaint_manager":
    case "ticket_compensation_manager":
    case "ticket_store_manager":
    case "ticket_general_manager":
      return { title: "مدير التكت", badge: "Ticket Manager" };
    case "footer_manager":
      return { title: "مدير الفوتر", badge: "Footer Manager" };
    default:
      if (isInstitutionRosterStaffRole(role)) {
        const id = branchIdFromInstitutionRosterStaffRole(role);
        if (id) {
          return {
            title: INSTITUTION_BRANCH_META[id].labelAr,
            badge: "مؤسسة",
          };
        }
      }
      return { title: "لوحة التحكم", badge: "Staff" };
  }
}

const AdminLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [dashboardTheme, setDashboardTheme] = useState<AdminDashboardTheme>(() => readAdminDashboardTheme());

  useLayoutEffect(() => {
    const root = document.documentElement;
    const body = document.body;
    const isDark = dashboardTheme === "dark";
    /**
     * الموقع العام يضع `class="dark"` على body في index.html؛ Tailwind يفعّل `dark:` من أي أسلاف.
     * لو زال `dark` من html فقط مع بقائه على body تبقى البطاقات والشارت «داكنة» في وضع اللوحة الفاتح.
     */
    root.classList.toggle("dark", isDark);
    body.classList.toggle("dark", isDark);
    root.setAttribute("data-dashboard-theme", dashboardTheme);
    return () => {
      root.classList.remove("dark");
      body.classList.add("dark");
      root.removeAttribute("data-dashboard-theme");
    };
  }, [dashboardTheme]);

  useEffect(() => {
    persistAdminDashboardTheme(dashboardTheme);
  }, [dashboardTheme]);

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
  const { applications } = useApplicationsContent();
  const tickets = useTicketsCenter();

  const userRoles = user?.roles ?? [];
  const ticketUnreadByRole = useMemo(() => {
    const allowedRoles = isSuperAdmin
      ? new Set(TICKET_TYPE_NAV.map((item) => item.role))
      : new Set(TICKET_TYPE_NAV.filter((item) => userRoles.includes(item.role)).map((item) => item.role));
    const counts = new Map<TicketTypeRole, number>();
    for (const ticket of tickets) {
      if (!allowedRoles.has(ticket.typeRole)) continue;
      const cutoff = ticket.lastStaffReadAt ? new Date(ticket.lastStaffReadAt).getTime() : 0;
      const hasUnread = ticket.messages.some(
        (m) => (m.senderType ?? "public") === "public" && new Date(m.at).getTime() > cutoff,
      );
      if (!hasUnread) continue;
      counts.set(ticket.typeRole, (counts.get(ticket.typeRole) ?? 0) + 1);
    }
    return counts;
  }, [tickets, userRoles, isSuperAdmin]);
  const totalTicketUnread = useMemo(
    () => Array.from(ticketUnreadByRole.values()).reduce((sum, count) => sum + count, 0),
    [ticketUnreadByRole],
  );
  const storeOrdersUnread = useMemo(() => {
    if (!userRoles.includes("super_admin") && !userRoles.includes("store_orders_manager")) return 0;
    let n = 0;
    for (const ticket of tickets) {
      if (ticket.typeRole !== "ticket_store_manager") continue;
      const cutoff = ticket.lastStaffReadAt ? new Date(ticket.lastStaffReadAt).getTime() : 0;
      const hasUnread = ticket.messages.some(
        (m) => (m.senderType ?? "public") === "public" && new Date(m.at).getTime() > cutoff,
      );
      if (hasUnread) n++;
    }
    return n;
  }, [tickets, userRoles]);
  const pendingApplicationsCount = useMemo(
    () =>
      countPendingServerApplicationsForStaff(applications, {
        isSuperAdmin: !!isSuperAdmin,
        isApplicationReviewer: !!isApplicationReviewer,
        userRoles: userRoles,
      }),
    [applications, isSuperAdmin, isApplicationReviewer, userRoles],
  );

  const pendingStreamerApplicationsCount = useMemo(
    () => countPendingStreamerApplications(applications),
    [applications],
  );

  const pendingJobApplicationsCount = useMemo(
    () =>
      countPendingJobApplicationsForStaff(applications, {
        isSuperAdmin: !!isSuperAdmin,
        userRoles: userRoles,
      }),
    [applications, isSuperAdmin, userRoles],
  );

  const sidebarBadgeByPath = useMemo(() => {
    const map = new Map<string, number>();
    if (totalTicketUnread > 0) {
      map.set("/dashboard/tickets", totalTicketUnread);
    }
    if (storeOrdersUnread > 0) {
      map.set("/dashboard/store-orders", storeOrdersUnread);
    }
    if (pendingApplicationsCount > 0) {
      map.set("/dashboard/applications", pendingApplicationsCount);
    }
    if (pendingJobApplicationsCount > 0) {
      map.set("/dashboard/institution", pendingJobApplicationsCount);
    }
    if (pendingStreamerApplicationsCount > 0) {
      map.set("/dashboard/streamers", pendingStreamerApplicationsCount);
    }
    return map;
  }, [totalTicketUnread, storeOrdersUnread, pendingApplicationsCount, pendingJobApplicationsCount, pendingStreamerApplicationsCount]);

  const renderSidebarBadge = (path: string, count: number) => {
    if (count <= 0) return null;
    const tone =
      path === "/dashboard/applications"
        ? "bg-amber-500"
        : path === "/dashboard/institution"
          ? "bg-sky-500"
          : path === "/dashboard/streamers"
            ? "bg-fuchsia-500"
            : "bg-rose-500";
    const title =
      path === "/dashboard/applications"
        ? "طلبات تقديم بانتظار المراجعة"
        : path === "/dashboard/institution"
          ? "طلبات توظيف بانتظار المراجعة"
          : path === "/dashboard/streamers"
            ? "طلبات ستريمر بانتظار المراجعة"
            : path === "/dashboard/store-orders"
            ? "طلبات متجر جديدة"
            : "تكتات بانتظار الرد";
    return (
      <span
        className={cn(
          "inline-flex min-w-5 items-center justify-center rounded-full px-1.5 text-[10px] font-semibold text-white shadow-sm",
          tone,
        )}
        title={title}
      >
        {count}
      </span>
    );
  };

  const sidebarNav = useMemo(() => {
    const filterNav = (arr: NavItem[]) => arr.filter((n) => n.roles.some((r) => userRoles.includes(r)));
    const instNav: NavItem[] = [];
    if (isSuperAdmin) {
      instNav.push({
        to: "/dashboard/institution",
        label: "المؤسسات",
        icon: Building2,
        roles: ["super_admin"],
        end: true,
      });
    } else if (userRoles.some((r) => isInstitutionRosterStaffRole(r))) {
      const rosterRoles = userRoles.filter((r): r is (typeof INSTITUTION_ROSTER_STAFF_ROLES)[number] =>
        isInstitutionRosterStaffRole(r),
      );
      instNav.push({
        to: "/dashboard/institution",
        label: "المؤسسات",
        icon: Building2,
        roles: rosterRoles,
        end: true,
      });
    }

    return {
      navLeading: filterNav(STATIC_NAV_LEADING),
      navStore: filterNav(STORE_SIDEBAR_NAV),
      navTrailing: [...filterNav(STATIC_NAV_TRAILING), ...instNav, ...filterNav(STATIC_NAV_TAIL)],
    };
  }, [userRoles, isSuperAdmin]);

  const storeSectionActive = useMemo(
    () => STORE_SIDEBAR_PREFIXES.some((prefix) => location.pathname.startsWith(prefix)),
    [location.pathname],
  );
  const [storeGroupOpen, setStoreGroupOpen] = useState(false);
  useEffect(() => {
    if (storeSectionActive) setStoreGroupOpen(true);
  }, [storeSectionActive]);

  const primary = primaryStaffRole(userRoles);
  const shell = primary ? adminRoleShell(primary) : { title: "لوحة التحكم", badge: "Staff" };
  const title = shell.title;
  const badge = shell.badge;

  const pageTitle =
    location.pathname === "/dashboard"
      ? "نظرة عامة"
        : location.pathname.startsWith("/dashboard/role-groups")
          ? "مجموعات الرتب"
        : location.pathname.startsWith("/dashboard/users")
        ? "المستخدمون"
        : location.pathname.startsWith("/dashboard/activity")
          ? "سجل النشاط"
          : location.pathname.startsWith("/dashboard/laws")
            ? "تحرير القوانين"
            : location.pathname.startsWith("/dashboard/quiz")
              ? "أسئلة التقديم"
            : location.pathname.startsWith("/dashboard/streamers")
              ? "ستريمر منجر"
              : location.pathname.startsWith("/dashboard/gangs")
                ? "مدير العصابات"
                : location.pathname.startsWith("/dashboard/vip-cars")
                  ? "مدير سيارات VIP"
                  : location.pathname.startsWith("/dashboard/houses")
                    ? "مدير البيوت"
                  : location.pathname.startsWith("/dashboard/packages")
                    ? "مدير البكجات"
                  : location.pathname.startsWith("/dashboard/investments")
                    ? "مدير الاستثمار"
                  : location.pathname.startsWith("/dashboard/store-orders")
                    ? "طلبات المتاجر"
                  : location.pathname.startsWith("/dashboard/about")
                    ? "مدير من نحن"
                    : location.pathname.startsWith("/dashboard/footer")
                      ? "مدير الفوتر"
                    : location.pathname.startsWith("/dashboard/tickets")
                      ? "التكت"
                  : location.pathname === "/dashboard/institution"
                    ? "المؤسسات"
                    : location.pathname.startsWith("/dashboard/institution/")
                      ? (() => {
                          const seg = location.pathname.slice("/dashboard/institution/".length).split("/")[0];
                          return seg && isInstitutionBranchId(seg)
                            ? INSTITUTION_BRANCH_META[seg].labelAr
                            : "مؤسسة";
                        })()
                    : location.pathname.startsWith("/dashboard/applications")
                      ? "طلبات التقديم"
                      : "لوحة التحكم";

  const subHint =
    userRoles.length > 1
      ? ""
      : isLawsEditor
        ? "صلاحية قوانين"
        : isStreamerManager
          ? "صلاحية بث"
          : isGangManager
            ? "صلاحية عصابات"
            : isVipCarsManager
              ? "صلاحية سيارات VIP"
              : userRoles.includes("houses_manager")
                ? "صلاحية البيوت"
              : userRoles.includes("packages_manager")
                ? "صلاحية البكجات"
              : userRoles.includes("investments_manager")
                ? "صلاحية الاستثمار"
              : userRoles.includes("quiz_manager")
                ? "صلاحية أسئلة التقديم"
                  : userRoles.includes("about_manager")
                    ? "صلاحية من نحن"
                    : userRoles.includes("store_orders_manager")
                      ? "طلبات المتاجر"
                    : userRoles.some((r) =>
                        [
                          "ticket_support_manager",
                          "ticket_admin_inquiry_manager",
                          "ticket_player_complaint_manager",
                          "ticket_compensation_manager",
                          "ticket_store_manager",
                          "ticket_general_manager",
                        ].includes(r),
                      )
                      ? "صلاحية التكت"
                      : userRoles.includes("footer_manager")
                        ? "صلاحية الفوتر"
              : isInstitutionRosterManager
                ? "صلاحية طاقم مؤسسة"
                : isApplicationReviewer
                  ? "مراجعة تقديمات"
                  : "";

  const isDashDark = dashboardTheme === "dark";

  const renderSidebarLink = (item: NavItem, options?: { indent?: boolean }) => (
    <NavLink
      key={item.to}
      to={item.to}
      end={item.end}
      className={({ isActive }) =>
        cn(
          "flex items-center gap-2.5 rounded-xl px-3 py-2.5 font-display text-sm transition-all duration-200",
          options?.indent && "ps-5",
          isActive
            ? "bg-violet-600/35 font-semibold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.12)] ring-1 ring-violet-400/35"
            : "text-slate-400 hover:bg-white/[0.06] hover:text-white",
        )
      }
    >
      <item.icon className="h-4 w-4 shrink-0 opacity-90" />
      <span className="min-w-0 flex-1">{item.label}</span>
      {renderSidebarBadge(item.to, sidebarBadgeByPath.get(item.to) ?? 0)}
    </NavLink>
  );

  return (
    <div
      dir="rtl"
      className={cn(
        "admin-dashboard-root min-h-screen antialiased transition-colors duration-200",
        isDashDark ? "bg-slate-950 text-slate-100" : "bg-slate-100 text-slate-900",
      )}
    >
      <div className="flex min-h-screen flex-col lg:flex-row">
        <aside className="admin-sidebar relative z-40 flex max-h-screen w-full shrink-0 flex-col border-b border-white/10 bg-gradient-to-b from-slate-950 via-[hsl(265_32%_14%)] to-slate-950 pt-[env(safe-area-inset-top,0px)] shadow-[0_12px_40px_-24px_rgba(0,0,0,0.65)] lg:fixed lg:inset-y-0 lg:right-0 lg:h-screen lg:max-h-screen lg:w-[17.5rem] lg:border-b-0 lg:border-l lg:border-white/10">
          <div className="shrink-0 border-b border-white/10 px-5 py-6">
            <div className="flex items-center gap-3">
              <img
                src="/INF_LOGO.png"
                alt="Infinite City"
                className="h-12 w-12 shrink-0 object-contain drop-shadow-[0_0_16px_hsl(272_82%_58%/0.45)]"
                loading="eager"
              />
              <div className="min-w-0 flex-1 text-right">
                <p className="font-display text-[10px] tracking-[0.28em] text-slate-400">INFINITE CITY</p>
                <p className="mt-1 font-display text-lg font-bold leading-tight text-white">{title}</p>
                <p className="mt-1.5 text-xs text-slate-400">
                  {user?.username}
                  <span className="mx-1.5 text-slate-600">·</span>
                  <span className="rounded-md bg-violet-600/35 px-1.5 py-0.5 font-mono text-[10px] text-violet-100">
                    {badge}
                  </span>
                </p>
              </div>
            </div>
          </div>
          <nav className="admin-sidebar-nav flex min-h-0 flex-1 flex-col gap-0.5 overflow-y-auto p-3">
            <span className="px-3 py-2 font-display text-[11px] font-medium text-slate-500">التنقل</span>
            {sidebarNav.navLeading.map((item) => renderSidebarLink(item))}
            {sidebarNav.navStore.length > 0 ? (
              <div className="mt-1 rounded-xl border border-violet-500/25 bg-violet-950/40 p-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
                <button
                  type="button"
                  aria-expanded={storeGroupOpen}
                  onClick={() => setStoreGroupOpen((o) => !o)}
                  className={cn(
                    "flex w-full items-center gap-2 rounded-lg px-2.5 py-2.5 font-display transition-all duration-200",
                    storeSectionActive
                      ? "bg-violet-600/30 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.1)] ring-1 ring-violet-400/35"
                      : "text-slate-400 hover:bg-violet-600/15 hover:text-violet-100",
                  )}
                >
                  <Store
                    className={cn(
                      "h-4 w-4 shrink-0 transition-colors",
                      storeSectionActive ? "text-fuchsia-300" : "text-violet-400",
                    )}
                    aria-hidden
                  />
                  <span
                    className={cn(
                      "min-w-0 flex-1 text-right text-sm font-bold tracking-wide sm:text-[15px]",
                      storeSectionActive
                        ? "bg-gradient-to-l from-fuchsia-200 via-violet-100 to-violet-200 bg-clip-text text-transparent"
                        : "bg-gradient-to-l from-slate-200 to-violet-300 bg-clip-text text-transparent",
                    )}
                  >
                    المتجر
                  </span>
                  {storeOrdersUnread > 0 ? renderSidebarBadge("/dashboard/store-orders", storeOrdersUnread) : null}
                  <ChevronDown
                    className={cn(
                      "h-4 w-4 shrink-0 transition-transform duration-200",
                      storeGroupOpen ? "rotate-180 text-violet-200" : "text-slate-500",
                    )}
                    aria-hidden
                  />
                </button>
                {storeGroupOpen ? (
                  <div className="mt-0.5 flex flex-col gap-0.5 pb-0.5">
                    {sidebarNav.navStore.map((item) => renderSidebarLink(item, { indent: true }))}
                  </div>
                ) : null}
              </div>
            ) : null}
            {sidebarNav.navTrailing.map((item) => renderSidebarLink(item))}

            <div className="mt-3 space-y-2 border-t border-white/10 pt-3">
              {isLawsEditor ? (
                <p className="px-3 text-[11px] leading-relaxed text-slate-400">
                  <Scale className="me-1 inline h-3 w-3 text-violet-400" />
                  القوانين تتحدث للزوّار بعد الحفظ.
                </p>
              ) : null}
              {isStreamerManager ? (
                <p className="px-3 text-[11px] leading-relaxed text-slate-400">
                  <Video className="me-1 inline h-3 w-3 text-violet-400" />
                  البطاقات و«طلبات الستريمر» — عند القبول تُضاف البطاقة تلقائياً لصفحة صنّاع المحتوى.
                </p>
              ) : null}
              {isGangManager ? (
                <p className="px-3 text-[11px] leading-relaxed text-slate-400">
                  <Swords className="me-1 inline h-3 w-3 text-violet-400" />
                  العصابات والشعارات محلياً.
                </p>
              ) : null}
              {isVipCarsManager ? (
                <p className="px-3 text-[11px] leading-relaxed text-slate-400">
                  <Car className="me-1 inline h-3 w-3 text-violet-400" />
                  كتالوج VIP والصور محلياً.
                </p>
              ) : null}
              {isInstitutionRosterManager ? (
                <p className="px-3 text-[11px] leading-relaxed text-slate-400">
                  <Building2 className="me-1 inline h-3 w-3 text-violet-400" />
                  {userRoles.filter((r) => isInstitutionRosterStaffRole(r)).length > 1
                    ? "اختر المؤسسة من الكروت لتحرير الطاقم؛ القوانين والأسئلة من داخل المحرر."
                    : "تحرير الطاقم وطلبات التوظيف؛ القوانين والأسئلة من زر داخل المحرر."}
                </p>
              ) : null}
              {isApplicationReviewer ? (
                <p className="px-3 text-[11px] leading-relaxed text-slate-400">
                  <ClipboardList className="me-1 inline h-3 w-3 text-violet-400" />
                  طلبات دخول السيرفر (/apply): قبول أو رفض — وليس طلبات الوظائف.
                </p>
              ) : null}
            </div>
          </nav>
          <div className="shrink-0 space-y-0.5 border-t border-white/10 p-3">
            <Link
              to="/"
              className="flex items-center gap-2 rounded-xl px-3 py-2 font-display text-sm text-slate-400 transition-colors hover:bg-white/[0.06] hover:text-white"
            >
              <ExternalLink className="h-4 w-4 shrink-0" />
              الموقع العام
            </Link>
          </div>
        </aside>

        <div className="flex min-h-screen min-w-0 flex-1 flex-col lg:mr-[17.5rem]">
          <header
            className={cn(
              "sticky top-0 z-30 flex items-center justify-between gap-3 border-b px-4 py-3.5 backdrop-blur-md sm:gap-4 sm:px-6",
              isDashDark
                ? "border-slate-700/90 bg-slate-900/92 shadow-[0_1px_0_rgba(0,0,0,0.35)]"
                : "border-slate-200/90 bg-white/90 shadow-[0_1px_0_rgba(15,23,42,0.06)]",
            )}
          >
            <div className="min-w-0 flex-1 text-right">
              <p
                className={cn(
                  "truncate font-display text-sm font-semibold",
                  isDashDark ? "text-slate-100" : "text-slate-900",
                )}
              >
                {pageTitle}
              </p>
              <p className={cn("truncate text-xs", isDashDark ? "text-slate-400" : "text-slate-500")}>
                {isSuperAdmin
                  ? "مرحباً بك يا سوبر أدمن"
                  : subHint
                    ? `${user?.username} · ${subHint}`
                    : (user?.username ?? "")}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="icon"
                className={cn(
                  "h-9 w-9 shrink-0",
                  isDashDark
                    ? "border-slate-600 bg-slate-800 text-amber-300 hover:border-amber-400/50 hover:bg-slate-700 hover:text-amber-200"
                    : "border-slate-200 bg-white text-slate-700 hover:border-violet-300 hover:bg-violet-50 hover:text-violet-900",
                )}
                aria-label={isDashDark ? "تفعيل الوضع الفاتح" : "تفعيل الوضع الداكن"}
                title={isDashDark ? "وضع فاتح" : "وضع داكن"}
                onClick={() => setDashboardTheme(isDashDark ? "light" : "dark")}
              >
                {isDashDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </Button>
              <Button
                type="button"
                variant="outline"
                className={cn(
                  "shrink-0",
                  isDashDark
                    ? "border-slate-600 bg-slate-800 text-slate-200 hover:border-slate-500 hover:bg-slate-700 hover:text-white"
                    : "border-slate-200 bg-white text-slate-700 hover:border-violet-300 hover:bg-violet-50 hover:text-violet-900",
                )}
                onClick={() => {
                  logout();
                  navigate("/", { replace: true });
                }}
              >
                <LogOut className="ms-2 h-4 w-4" />
                خروج
              </Button>
            </div>
          </header>

          <main className="admin-workspace-main flex-1 px-4 py-8 sm:px-6 lg:px-10">
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

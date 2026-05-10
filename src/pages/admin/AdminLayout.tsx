import { useMemo } from "react";
import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  BookOpen,
  Building2,
  Car,
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
  Swords,
  TrendingUp,
  Users,
  Video,
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
import { useTicketsCenter, type TicketTypeRole } from "@/lib/ticketsCenter";
import "@/styles/admin-dashboard.css";

type NavItem = { to: string; label: string; icon: typeof LayoutDashboard; roles: StaffRole[]; end?: boolean };

const STATIC_NAV_CORE: NavItem[] = [
  { to: "/dashboard", label: "نظرة عامة", icon: LayoutDashboard, roles: ["super_admin"], end: true },
  { to: "/dashboard/users", label: "المستخدمون والأدوار", icon: Users, roles: ["super_admin"] },
  { to: "/dashboard/role-groups", label: "مجموعات الرتب", icon: Layers, roles: ["super_admin"] },
  { to: "/dashboard/activity", label: "سجل النشاط", icon: History, roles: ["super_admin"] },
  { to: "/dashboard/laws", label: "تحرير القوانين", icon: BookOpen, roles: ["super_admin", "laws_editor"] },
  { to: "/dashboard/streamers", label: "ستريمر منجر", icon: Video, roles: ["super_admin", "streamer_manager"] },
  { to: "/dashboard/gangs", label: "مدير العصابات", icon: Swords, roles: ["super_admin", "gang_manager"] },
  { to: "/dashboard/vip-cars", label: "مدير سيارات VIP", icon: Car, roles: ["super_admin", "vip_cars_manager"] },
  { to: "/dashboard/houses", label: "مدير البيوت", icon: Home, roles: ["super_admin", "houses_manager"] },
  { to: "/dashboard/packages", label: "مدير البكجات", icon: Package, roles: ["super_admin", "packages_manager"] },
  { to: "/dashboard/investments", label: "مدير الاستثمار", icon: TrendingUp, roles: ["super_admin", "investments_manager"] },
  {
    to: "/dashboard/store-orders",
    label: "طلبات المتاجر",
    icon: ShoppingBag,
    roles: ["super_admin", "store_orders_manager"],
  },
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
  const unreadByTicketPath = useMemo(() => {
    const map = new Map<string, number>();
    if (totalTicketUnread > 0) {
      map.set("/dashboard/tickets", totalTicketUnread);
    }
    if (storeOrdersUnread > 0) {
      map.set("/dashboard/store-orders", storeOrdersUnread);
    }
    return map;
  }, [totalTicketUnread, storeOrdersUnread]);

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
        : location.pathname.startsWith("/dashboard/role-groups")
          ? "مجموعات الرتب"
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
              : userRoles.includes("houses_manager")
                ? "صلاحية البيوت"
              : userRoles.includes("packages_manager")
                ? "صلاحية البكجات"
              : userRoles.includes("investments_manager")
                ? "صلاحية الاستثمار"
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

  return (
    <div dir="rtl" className="min-h-screen bg-slate-100 text-slate-900 antialiased">
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
            {items.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-2.5 rounded-xl px-3 py-2.5 font-display text-sm transition-all duration-200",
                    isActive
                      ? "bg-violet-600/35 font-semibold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.12)] ring-1 ring-violet-400/35"
                      : "text-slate-400 hover:bg-white/[0.06] hover:text-white",
                  )
                }
              >
                <item.icon className="h-4 w-4 shrink-0 opacity-90" />
                <span className="min-w-0 flex-1">{item.label}</span>
                {(unreadByTicketPath.get(item.to) ?? 0) > 0 ? (
                  <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-rose-500 px-1.5 text-[10px] font-semibold text-white shadow-sm">
                    {unreadByTicketPath.get(item.to)}
                  </span>
                ) : null}
              </NavLink>
            ))}

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
                  البطاقات محلياً في المتصفح — طلبات التقديم كصانع محتوى من «طلبات التقديم» (قبول / رفض).
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
                    ? "لكل فرع صفحة منفصلة من القائمة أو من صفحة الطواقم."
                    : "تعديل طاقم الفرع المرتبط بدورك فقط."}
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
          <header className="sticky top-0 z-30 flex items-center justify-between gap-4 border-b border-slate-200/90 bg-white/90 px-4 py-3.5 shadow-[0_1px_0_rgba(15,23,42,0.06)] backdrop-blur-md sm:px-6">
            <div className="min-w-0 text-right">
              <p className="truncate font-display text-sm font-semibold text-slate-900">{pageTitle}</p>
              <p className="truncate text-xs text-slate-500">
                {isSuperAdmin ? "مرحباً بك يا سوبر أدمن" : `${user?.username} · ${subHint}`}
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              className="shrink-0 border-slate-200 bg-white text-slate-700 hover:border-violet-300 hover:bg-violet-50 hover:text-violet-900"
              onClick={() => {
                logout();
                navigate("/", { replace: true });
              }}
            >
              <LogOut className="ms-2 h-4 w-4" />
              خروج
            </Button>
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

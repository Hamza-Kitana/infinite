import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { SUPER_ADMIN_PASSWORD, SUPER_ADMIN_USERNAME } from "@/config/staffAuth";
import {
  INSTITUTION_BRANCH_IDS,
  institutionRosterBranchIdsFromRoleList,
  institutionRosterStaffRoleForBranch,
  isInstitutionBranchId,
  isInstitutionRosterStaffRole,
  type InstitutionBranchId,
  type InstitutionRosterStaffRole,
} from "@/data/institutionBranches";
import { appendActivityLog } from "@/lib/activityLog";
import {
  ALL_TICKET_STAFF_ROLES,
  DASHBOARD_TICKET_STAFF_ROLES,
  migrateStaffTicketRole,
  type TicketTypeRole,
} from "@/lib/ticketTypesConfig";
import {
  findManagedUserByCredentials,
  findManagedUserByPublicId,
  loadManagedUsers,
} from "@/staff/staffDirectory";

export type CoreStaffRole =
  | "super_admin"
  | "laws_editor"
  | "streamer_manager"
  | "gang_manager"
  | "vip_cars_manager"
  | "houses_manager"
  | "packages_manager"
  | "investments_manager"
  | "quiz_manager"
  | "application_reviewer"
  | "about_manager"
  | "store_orders_manager"
  | TicketTypeRole;

export type StaffRole = CoreStaffRole | InstitutionRosterStaffRole;

const CORE_STAFF_NO_SUPER: readonly CoreStaffRole[] = [
  "laws_editor",
  "streamer_manager",
  "gang_manager",
  "vip_cars_manager",
  "houses_manager",
  "packages_manager",
  "investments_manager",
  "quiz_manager",
  "application_reviewer",
  "about_manager",
  "store_orders_manager",
  ...ALL_TICKET_STAFF_ROLES,
];

function isCoreStaffRoleNoSuper(v: string): v is Exclude<CoreStaffRole, "super_admin"> {
  return (CORE_STAFF_NO_SUPER as readonly string[]).includes(v);
}

export function isStaffRole(v: unknown): v is StaffRole {
  if (typeof v !== "string") return false;
  if (v === "super_admin") return true;
  if (isCoreStaffRoleNoSuper(v)) return true;
  return isInstitutionRosterStaffRole(v);
}

/** ترحيل جلسة قديمة: institution_manager + institutionBranchId */
function migrateRawRoles(raw: readonly string[], legacyBranch?: string): StaffRole[] {
  const out = new Set<StaffRole>();
  for (const r of raw) {
    if (r === "institution_manager") {
      if (legacyBranch && isInstitutionBranchId(legacyBranch)) {
        out.add(institutionRosterStaffRoleForBranch(legacyBranch));
      }
      continue;
    }
    if (r === "footer_manager") continue;
    const migrated = migrateStaffTicketRole(r);
    if (isStaffRole(migrated)) out.add(migrated);
  }
  return [...out];
}

export type StaffUser = {
  username: string;
  roles: StaffRole[];
  managedId?: string;
};

function hasRole(user: StaffUser | null, role: StaffRole): boolean {
  return !!user?.roles.includes(role);
}

/** أول فرع طاقم يطابقه أحد أدوار المستخدم (ترتيب الفروع الثابت) */
export function primaryInstitutionRosterBranchId(roles: readonly StaffRole[]): InstitutionBranchId | undefined {
  for (const id of INSTITUTION_BRANCH_IDS) {
    if (roles.includes(institutionRosterStaffRoleForBranch(id))) return id;
  }
  return undefined;
}

export function getPostLoginDashboardPath(roles: StaffRole[]): string {
  if (roles.includes("super_admin")) return "/dashboard";
  const order: [Exclude<CoreStaffRole, "super_admin">, string][] = [
    ["laws_editor", "/dashboard/laws"],
    ["streamer_manager", "/dashboard/streamers"],
    ["gang_manager", "/dashboard/gangs"],
    ["vip_cars_manager", "/dashboard/vip-cars"],
    ["houses_manager", "/dashboard/houses"],
    ["packages_manager", "/dashboard/packages"],
    ["investments_manager", "/dashboard/investments"],
    ["quiz_manager", "/dashboard/quiz"],
    ["about_manager", "/dashboard/about"],
    ["store_orders_manager", "/dashboard/store-orders"],
    ["ticket_store_manager", "/dashboard/store-orders"],
    ...DASHBOARD_TICKET_STAFF_ROLES.map((r) => [r, "/dashboard/tickets"] as const),
  ];
  for (const [r, path] of order) {
    if (roles.includes(r)) return path;
  }
  if (roles.some((role) => isInstitutionRosterStaffRole(role))) {
    const ids = institutionRosterBranchIdsFromRoleList(roles);
    if (ids.length === 1) return `/dashboard/institution/${ids[0]}`;
    return "/dashboard/institution";
  }
  if (roles.includes("application_reviewer")) return "/dashboard/applications";
  return "/dashboard";
}

/** أول دور «تعرّفي» لعرض عنوان اللوحة الجانبية */
export function primaryStaffRole(roles: StaffRole[] | undefined): StaffRole | null {
  if (!roles?.length) return null;
  if (roles.includes("super_admin")) return "super_admin";
  const coreOrder: Exclude<CoreStaffRole, "super_admin">[] = [
    "laws_editor",
    "streamer_manager",
    "gang_manager",
    "vip_cars_manager",
    "houses_manager",
    "packages_manager",
    "investments_manager",
    "quiz_manager",
    "about_manager",
    "store_orders_manager",
    "ticket_store_manager",
    ...DASHBOARD_TICKET_STAFF_ROLES,
  ];
  for (const r of coreOrder) {
    if (roles.includes(r)) return r;
  }
  for (const id of INSTITUTION_BRANCH_IDS) {
    const rr = institutionRosterStaffRoleForBranch(id);
    if (roles.includes(rr)) return rr;
  }
  if (roles.includes("application_reviewer")) return "application_reviewer";
  return roles[0];
}

type AuthContextValue = {
  user: StaffUser | null;
  login: (username: string, password: string) => StaffUser | null;
  /**
   * يفتح جلسة موظف انطلاقاً من PublicUser مرتبط (مواطن مرقّى).
   * لا يطلب كلمة مرور — يعتمد على أن المستخدم سجّل دخولاً عبر دسكورد/الحساب العام.
   */
  adoptLinkedStaffSession: (publicUserId: string) => StaffUser | null;
  logout: () => void;
  hasRole: (role: StaffRole) => boolean;
  isSuperAdmin: boolean;
  isLawsEditor: boolean;
  isStreamerManager: boolean;
  isGangManager: boolean;
  isVipCarsManager: boolean;
  isHousesManager: boolean;
  isPackagesManager: boolean;
  isInvestmentsManager: boolean;
  isQuizManager: boolean;
  /** يملك أي دور طاقم مؤسسة (فرع محدد بالدور نفسه) */
  isInstitutionRosterManager: boolean;
  /** أول فرع طاقم يُستدل من الأدوار — للمعاينة وقفل المحرر */
  institutionBranchId?: InstitutionBranchId;
  canManageStaff: boolean;
  canEditLaws: boolean;
  canManageStreamers: boolean;
  canManageGangs: boolean;
  canManageVipCars: boolean;
  canManageHouses: boolean;
  canManagePackages: boolean;
  canManageInvestments: boolean;
  canManageQuiz: boolean;
  canEditInstitutionRosters: boolean;
  isApplicationReviewer: boolean;
  canReviewApplications: boolean;
  canUseDashboard: boolean;
};

const STORAGE_KEY = "ic_staff_session";
const MANAGED_EVENT_NAME = "ic-managed-staff";

const AuthContext = createContext<AuthContextValue | null>(null);

function parseRolesFromSession(parsed: Record<string, unknown>): StaffRole[] | null {
  const legacyBranch = typeof parsed.institutionBranchId === "string" ? parsed.institutionBranchId : undefined;
  if (Array.isArray(parsed.roles)) {
    const raw = parsed.roles.filter((x): x is string => typeof x === "string");
    const migrated = migrateRawRoles(raw, legacyBranch);
    return migrated.length ? migrated : null;
  }
  if (typeof parsed.role === "string") {
    const migrated = migrateRawRoles([parsed.role], legacyBranch);
    return migrated.length ? migrated : null;
  }
  return null;
}

function loadStoredUser(): StaffUser | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    if (!parsed || typeof parsed !== "object" || typeof parsed.username !== "string") return null;

    const roles = parseRolesFromSession(parsed);
    if (!roles) {
      sessionStorage.removeItem(STORAGE_KEY);
      return null;
    }

    const u: StaffUser = {
      username: parsed.username as string,
      roles,
      ...(typeof parsed.managedId === "string" ? { managedId: parsed.managedId } : {}),
    };

    const hadLegacy =
      (Array.isArray(parsed.roles) && (parsed.roles as string[]).includes("institution_manager")) ||
      parsed.role === "institution_manager" ||
      typeof parsed.institutionBranchId === "string";

    if (hadLegacy) {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(u));
    }

    return u;
  } catch {
    sessionStorage.removeItem(STORAGE_KEY);
  }
  return null;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<StaffUser | null>(() => loadStoredUser());

  const login = useCallback((username: string, password: string): StaffUser | null => {
    const u = username.trim().toLowerCase();

    /** يُرمى عند فشل sessionStorage حتى يعرض الواجهة رسالة مناسبة وليس «بيانات خاطئة» */
    const persistSession = (next: StaffUser, loginDetail: string) => {
      try {
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        throw new Error("IC_SESSION_STORAGE");
      }
      setUser(next);
      try {
        appendActivityLog(next.username, "تسجيل دخول", loginDetail);
      } catch {
        /* سجل النشاط لا يمنع الدخول */
      }
    };

    if (u === SUPER_ADMIN_USERNAME.toLowerCase() && password === SUPER_ADMIN_PASSWORD) {
      const next: StaffUser = { username: SUPER_ADMIN_USERNAME, roles: ["super_admin"] };
      persistSession(next, "سوبر أدمِن");
      return next;
    }
    const managed = findManagedUserByCredentials(username, password);
    if (managed) {
      const next: StaffUser = {
        username: managed.username,
        roles: [...managed.roles] as StaffRole[],
        managedId: managed.id,
      };
      persistSession(next, `أدوار: ${next.roles.join(", ")}`);
      return next;
    }
    return null;
  }, []);

  const adoptLinkedStaffSession = useCallback((publicUserId: string): StaffUser | null => {
    const managed = findManagedUserByPublicId(publicUserId);
    if (!managed || managed.isActive === false) return null;
    if (managed.roles.length === 0) return null;
    const next: StaffUser = {
      username: managed.username,
      roles: [...managed.roles] as StaffRole[],
      managedId: managed.id,
    };
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      return null;
    }
    setUser(next);
    try {
      appendActivityLog(next.username, "تسجيل دخول مواطن مرقّى", `أدوار: ${next.roles.join(", ")}`);
    } catch {
      /* سجل النشاط لا يمنع الجلسة */
    }
    return next;
  }, []);

  const logout = useCallback(() => {
    setUser((prev) => {
      if (prev?.username) {
        try {
          appendActivityLog(prev.username, "تسجيل خروج", prev.roles.join(", "));
        } catch {
          /* ignore */
        }
      }
      return null;
    });
    try {
      sessionStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    const syncManagedSession = () => {
      setUser((prev) => {
        if (!prev?.managedId) return prev;
        const latest = loadManagedUsers().find((u) => u.id === prev.managedId);
        if (!latest || latest.isActive === false) {
          try {
            sessionStorage.removeItem(STORAGE_KEY);
          } catch {
            /* ignore */
          }
          return null;
        }
        const next: StaffUser = {
          username: latest.username,
          roles: [...latest.roles] as StaffRole[],
          managedId: latest.id,
        };
        const changed =
          next.username !== prev.username ||
          next.roles.length !== prev.roles.length ||
          next.roles.some((r, i) => r !== prev.roles[i]);
        if (!changed) return prev;
        try {
          sessionStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        } catch {
          /* ignore */
        }
        return next;
      });
    };
    window.addEventListener(MANAGED_EVENT_NAME, syncManagedSession as EventListener);
    window.addEventListener("storage", syncManagedSession);
    return () => {
      window.removeEventListener(MANAGED_EVENT_NAME, syncManagedSession as EventListener);
      window.removeEventListener("storage", syncManagedSession);
    };
  }, []);

  const value = useMemo<AuthContextValue>(() => {
    const has = (r: StaffRole) => hasRole(user, r);
    const rosterBranch = user ? primaryInstitutionRosterBranchId(user.roles) : undefined;
    return {
      user,
      login,
      adoptLinkedStaffSession,
      logout,
      hasRole: has,
      isSuperAdmin: has("super_admin"),
      isLawsEditor: has("laws_editor"),
      isStreamerManager: has("streamer_manager"),
      isGangManager: has("gang_manager"),
      isVipCarsManager: has("vip_cars_manager"),
      isHousesManager: has("houses_manager"),
      isPackagesManager: has("packages_manager"),
      isInvestmentsManager: has("investments_manager"),
      isQuizManager: has("quiz_manager"),
      isInstitutionRosterManager: user ? user.roles.some((r) => isInstitutionRosterStaffRole(r)) : false,
      institutionBranchId: rosterBranch,
      canManageStaff: has("super_admin"),
      canEditLaws: has("super_admin") || has("laws_editor"),
      canManageStreamers: has("super_admin") || has("streamer_manager"),
      canManageGangs: has("super_admin") || has("gang_manager"),
      canManageVipCars: has("super_admin") || has("vip_cars_manager"),
      canManageHouses: has("super_admin") || has("houses_manager"),
      canManagePackages: has("super_admin") || has("packages_manager"),
      canManageInvestments: has("super_admin") || has("investments_manager"),
      canManageQuiz: has("super_admin") || has("quiz_manager"),
      canEditInstitutionRosters:
        has("super_admin") || (user ? user.roles.some((r) => isInstitutionRosterStaffRole(r)) : false),
      isApplicationReviewer: has("application_reviewer"),
      canReviewApplications: has("super_admin") || has("application_reviewer") || has("streamer_manager"),
      canUseDashboard:
        has("super_admin") ||
        has("laws_editor") ||
        has("streamer_manager") ||
        has("gang_manager") ||
        has("vip_cars_manager") ||
        has("houses_manager") ||
        has("packages_manager") ||
        has("investments_manager") ||
        has("quiz_manager") ||
        has("about_manager") ||
        ALL_TICKET_STAFF_ROLES.some((r) => has(r)) ||
        has("store_orders_manager") ||
        (user ? user.roles.some((r) => isInstitutionRosterStaffRole(r)) : false) ||
        has("application_reviewer"),
    };
  }, [user, login, adoptLinkedStaffSession, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth يجب أن يُستخدم داخل AuthProvider");
  }
  return ctx;
}

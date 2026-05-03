import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
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
import { findManagedUserByCredentials } from "@/staff/staffDirectory";

export type CoreStaffRole =
  | "super_admin"
  | "laws_editor"
  | "streamer_manager"
  | "gang_manager"
  | "vip_cars_manager"
  | "application_reviewer";

export type StaffRole = CoreStaffRole | InstitutionRosterStaffRole;

const CORE_STAFF_NO_SUPER: readonly CoreStaffRole[] = [
  "laws_editor",
  "streamer_manager",
  "gang_manager",
  "vip_cars_manager",
  "application_reviewer",
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
    if (isStaffRole(r)) out.add(r);
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
  logout: () => void;
  hasRole: (role: StaffRole) => boolean;
  isSuperAdmin: boolean;
  isLawsEditor: boolean;
  isStreamerManager: boolean;
  isGangManager: boolean;
  isVipCarsManager: boolean;
  /** يملك أي دور طاقم مؤسسة (فرع محدد بالدور نفسه) */
  isInstitutionRosterManager: boolean;
  /** أول فرع طاقم يُستدل من الأدوار — للمعاينة وقفل المحرر */
  institutionBranchId?: InstitutionBranchId;
  canManageStaff: boolean;
  canEditLaws: boolean;
  canManageStreamers: boolean;
  canManageGangs: boolean;
  canManageVipCars: boolean;
  canEditInstitutionRosters: boolean;
  isApplicationReviewer: boolean;
  canReviewApplications: boolean;
  canUseDashboard: boolean;
};

const STORAGE_KEY = "ic_staff_session";

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

  const value = useMemo<AuthContextValue>(() => {
    const has = (r: StaffRole) => hasRole(user, r);
    const rosterBranch = user ? primaryInstitutionRosterBranchId(user.roles) : undefined;
    return {
      user,
      login,
      logout,
      hasRole: has,
      isSuperAdmin: has("super_admin"),
      isLawsEditor: has("laws_editor"),
      isStreamerManager: has("streamer_manager"),
      isGangManager: has("gang_manager"),
      isVipCarsManager: has("vip_cars_manager"),
      isInstitutionRosterManager: user ? user.roles.some((r) => isInstitutionRosterStaffRole(r)) : false,
      institutionBranchId: rosterBranch,
      canManageStaff: has("super_admin"),
      canEditLaws: has("super_admin") || has("laws_editor"),
      canManageStreamers: has("super_admin") || has("streamer_manager"),
      canManageGangs: has("super_admin") || has("gang_manager"),
      canManageVipCars: has("super_admin") || has("vip_cars_manager"),
      canEditInstitutionRosters:
        has("super_admin") || (user ? user.roles.some((r) => isInstitutionRosterStaffRole(r)) : false),
      isApplicationReviewer: has("application_reviewer"),
      canReviewApplications: has("super_admin") || has("application_reviewer"),
      canUseDashboard:
        has("super_admin") ||
        has("laws_editor") ||
        has("streamer_manager") ||
        has("gang_manager") ||
        has("vip_cars_manager") ||
        (user ? user.roles.some((r) => isInstitutionRosterStaffRole(r)) : false) ||
        has("application_reviewer"),
    };
  }, [user, login, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth يجب أن يُستخدم داخل AuthProvider");
  }
  return ctx;
}

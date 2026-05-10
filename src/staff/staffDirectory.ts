/** مستخدمون يضيفهم سوبر الأدمِن فقط — مخزّنون محلياً (تجريبي) */

import {
  branchIdFromInstitutionRosterStaffRole,
  institutionRosterStaffRoleForBranch,
  isInstitutionBranchId,
  isInstitutionRosterStaffRole,
  type InstitutionBranchId,
  type InstitutionRosterStaffRole,
} from "@/data/institutionBranches";
import { evictSecondaryLocalData, isLocalStorageQuotaError } from "@/lib/localStorageQuota";

export type BaseManagedStaffRole =
  | "laws_editor"
  | "streamer_manager"
  | "gang_manager"
  | "vip_cars_manager"
  | "houses_manager"
  | "packages_manager"
  | "investments_manager"
  | "application_reviewer"
  | "about_manager"
  | "store_orders_manager"
  | "ticket_support_manager"
  | "ticket_admin_inquiry_manager"
  | "ticket_player_complaint_manager"
  | "ticket_compensation_manager"
  | "ticket_store_manager"
  | "ticket_general_manager"
  | "footer_manager";

export type ManagedStaffRole = BaseManagedStaffRole | InstitutionRosterStaffRole;

const BASE_MANAGED: readonly BaseManagedStaffRole[] = [
  "laws_editor",
  "streamer_manager",
  "gang_manager",
  "vip_cars_manager",
  "houses_manager",
  "packages_manager",
  "investments_manager",
  "application_reviewer",
  "about_manager",
  "store_orders_manager",
  "ticket_support_manager",
  "ticket_admin_inquiry_manager",
  "ticket_player_complaint_manager",
  "ticket_compensation_manager",
  "ticket_store_manager",
  "ticket_general_manager",
  "footer_manager",
];

function isBaseManagedStaffRole(v: unknown): v is BaseManagedStaffRole {
  return typeof v === "string" && (BASE_MANAGED as readonly string[]).includes(v);
}

function isManagedStaffRoleString(v: unknown): v is ManagedStaffRole {
  if (typeof v !== "string") return false;
  if (isBaseManagedStaffRole(v)) return true;
  return isInstitutionRosterStaffRole(v);
}

export type ManagedUser = {
  id: string;
  username: string;
  password: string;
  roles: ManagedStaffRole[];
  isActive?: boolean;
  /**
   * إن كان هذا المستخدم الموظف ناتجاً عن «ترقية مواطن»،
   * نحفظ هنا مرجع PublicUser.id لتمييز الترقيات عن الموظفين المنشؤين يدوياً.
   */
  linkedPublicUserId?: string;
};

const STORAGE_KEY = "ic_managed_staff_v1";
const EVENT_NAME = "ic-managed-staff";

/** ترحيل: institution_manager + institutionBranchId → institution_roster_<branch> */
function migrateLegacyRoles(rawRoles: unknown[], institutionBranchId: unknown): ManagedStaffRole[] {
  const rolesIn = rawRoles.filter((x): x is string => typeof x === "string");
  const out = new Set<ManagedStaffRole>();
  for (const r of rolesIn) {
    if (r === "institution_manager") {
      if (typeof institutionBranchId === "string" && isInstitutionBranchId(institutionBranchId)) {
        out.add(institutionRosterStaffRoleForBranch(institutionBranchId));
      }
      continue;
    }
    if (isManagedStaffRoleString(r)) out.add(r);
  }
  return [...out];
}

function normalizeRoles(row: unknown): ManagedStaffRole[] | null {
  if (!row || typeof row !== "object") return null;
  const legacyBranch = (row as { institutionBranchId?: unknown }).institutionBranchId;
  if ("roles" in row && Array.isArray((row as { roles: unknown }).roles)) {
    const migrated = migrateLegacyRoles((row as { roles: unknown[] }).roles, legacyBranch);
    return migrated.length ? migrated : null;
  }
  if ("role" in row) {
    const migrated = migrateLegacyRoles([(row as { role: unknown }).role], legacyBranch);
    return migrated.length ? migrated : null;
  }
  return null;
}

function safeParse(raw: string | null): ManagedUser[] {
  if (!raw) return [];
  try {
    const data = JSON.parse(raw) as unknown;
    if (!Array.isArray(data)) return [];
    return data.filter((row): row is ManagedUser => {
      if (
        !row ||
        typeof row !== "object" ||
        typeof (row as ManagedUser).id !== "string" ||
        typeof (row as ManagedUser).username !== "string" ||
        typeof (row as ManagedUser).password !== "string"
      ) {
        return false;
      }
      const roles = normalizeRoles(row);
      if (!roles) return false;
      return true;
    }).map((row) => {
      const roles = normalizeRoles(row)!;
      return {
        id: (row as ManagedUser).id,
        username: (row as ManagedUser).username,
        password: (row as ManagedUser).password,
        roles,
        isActive: (row as ManagedUser).isActive !== false,
        linkedPublicUserId:
          typeof (row as ManagedUser).linkedPublicUserId === "string"
            ? (row as ManagedUser).linkedPublicUserId
            : undefined,
      };
    });
  } catch {
    return [];
  }
}

export function loadManagedUsers(): ManagedUser[] {
  return safeParse(localStorage.getItem(STORAGE_KEY));
}

export function saveManagedUsers(users: ManagedUser[]) {
  const payload = JSON.stringify(users);
  for (let step = 0; step < 10; step++) {
    try {
      localStorage.setItem(STORAGE_KEY, payload);
      window.dispatchEvent(new CustomEvent(EVENT_NAME));
      return;
    } catch (e) {
      if (!isLocalStorageQuotaError(e)) throw e;
      evictSecondaryLocalData(step);
    }
  }
  localStorage.setItem(STORAGE_KEY, payload);
  window.dispatchEvent(new CustomEvent(EVENT_NAME));
}

export function addManagedUser(input: Omit<ManagedUser, "id">): ManagedUser {
  const users = loadManagedUsers();
  const next: ManagedUser = {
    ...input,
    isActive: true,
    id: crypto.randomUUID(),
  };
  saveManagedUsers([...users, next]);
  return next;
}

export function removeManagedUser(id: string) {
  const users = loadManagedUsers().filter((u) => u.id !== id);
  saveManagedUsers(users);
}

export function updateManagedUser(id: string, patch: Partial<Pick<ManagedUser, "username" | "password" | "roles" | "isActive">>) {
  const users = loadManagedUsers().map((u) => (u.id === id ? { ...u, ...patch } : u));
  saveManagedUsers(users);
}

export function findManagedUserByCredentials(username: string, password: string): ManagedUser | null {
  const u = username.trim().toLowerCase();
  /** المواطن المرقّى لا يحمل كلمة مرور لمنع تسجيل الدخول من نافذة Lock — يدخل عبر الدسكورد ويُتبنّى تلقائياً */
  if (!password.length) return null;
  return loadManagedUsers().find(
    (m) =>
      m.username.toLowerCase() === u &&
      m.password.length > 0 &&
      m.password === password &&
      m.isActive !== false,
  ) ?? null;
}

/** يبحث عن ملف موظف مرتبط بحساب مواطن معيّن — يُستخدم في صفحة الإدارة */
export function findManagedUserByPublicId(publicUserId: string): ManagedUser | null {
  return loadManagedUsers().find((m) => m.linkedPublicUserId === publicUserId) ?? null;
}

/** فروع الطاقم المصرّح بها من قائمة أدوار المستخدم */
export function institutionRosterBranchIdsFromRoles(roles: readonly ManagedStaffRole[]): InstitutionBranchId[] {
  const ids = roles
    .map((r) => (typeof r === "string" ? branchIdFromInstitutionRosterStaffRole(r) : null))
    .filter((x): x is NonNullable<typeof x> => x != null);
  return [...new Set(ids)];
}

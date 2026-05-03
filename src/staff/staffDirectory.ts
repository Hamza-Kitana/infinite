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
  | "application_reviewer";

export type ManagedStaffRole = BaseManagedStaffRole | InstitutionRosterStaffRole;

const BASE_MANAGED: readonly BaseManagedStaffRole[] = [
  "laws_editor",
  "streamer_manager",
  "gang_manager",
  "vip_cars_manager",
  "application_reviewer",
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
};

const STORAGE_KEY = "ic_managed_staff_v1";

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
      return;
    } catch (e) {
      if (!isLocalStorageQuotaError(e)) throw e;
      evictSecondaryLocalData(step);
    }
  }
  localStorage.setItem(STORAGE_KEY, payload);
}

export function addManagedUser(input: Omit<ManagedUser, "id">): ManagedUser {
  const users = loadManagedUsers();
  const next: ManagedUser = {
    ...input,
    id: crypto.randomUUID(),
  };
  saveManagedUsers([...users, next]);
  return next;
}

export function removeManagedUser(id: string) {
  const users = loadManagedUsers().filter((u) => u.id !== id);
  saveManagedUsers(users);
}

export function updateManagedUser(id: string, patch: Partial<Pick<ManagedUser, "username" | "password" | "roles">>) {
  const users = loadManagedUsers().map((u) => (u.id === id ? { ...u, ...patch } : u));
  saveManagedUsers(users);
}

export function findManagedUserByCredentials(username: string, password: string): ManagedUser | null {
  const u = username.trim().toLowerCase();
  return loadManagedUsers().find((m) => m.username.toLowerCase() === u && m.password === password) ?? null;
}

/** فروع الطاقم المصرّح بها من قائمة أدوار المستخدم */
export function institutionRosterBranchIdsFromRoles(roles: readonly ManagedStaffRole[]): InstitutionBranchId[] {
  const ids = roles
    .map((r) => (typeof r === "string" ? branchIdFromInstitutionRosterStaffRole(r) : null))
    .filter((x): x is NonNullable<typeof x> => x != null);
  return [...new Set(ids)];
}

/**
 * مجموعات رتب — يُنشئها السوبر أدمن ويعيد استخدامها لإسناد عدّة رتب
 * دفعة واحدة إلى موظفين أو مواطنين مرقّين.
 *
 * تُخزَّن محلياً (تجريبي).
 */

import {
  isInstitutionRosterStaffRole,
  type InstitutionRosterStaffRole,
} from "@/data/institutionBranches";
import { evictSecondaryLocalData, isLocalStorageQuotaError } from "@/lib/localStorageQuota";
import type { ManagedStaffRole } from "@/staff/staffDirectory";

export type StaffRoleGroup = {
  id: string;
  name: string;
  description?: string;
  /** الرتب الأساسية + رتب طواقم المؤسسات */
  roles: ManagedStaffRole[];
  /** ms — لعرض «أُنشئت في…» */
  createdAt: string;
  /** آخر تحديث */
  updatedAt: string;
};

const STORAGE_KEY = "ic_staff_role_groups_v1";
export const ROLE_GROUPS_EVENT = "ic-staff-role-groups";

/** قائمة جميع الرتب الأساسية المعتمدة (مكرّرة هنا للحفاظ على الاستقلال) */
const BASE_VALID: readonly string[] = [
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

function isValidStaffRole(v: unknown): v is ManagedStaffRole {
  if (typeof v !== "string") return false;
  if (BASE_VALID.includes(v)) return true;
  return isInstitutionRosterStaffRole(v);
}

function safeParse(raw: string | null): StaffRoleGroup[] {
  if (!raw) return [];
  try {
    const data = JSON.parse(raw) as unknown;
    if (!Array.isArray(data)) return [];
    return data
      .filter(
        (row): row is StaffRoleGroup =>
          !!row &&
          typeof row === "object" &&
          typeof (row as StaffRoleGroup).id === "string" &&
          typeof (row as StaffRoleGroup).name === "string" &&
          Array.isArray((row as StaffRoleGroup).roles),
      )
      .map((row) => {
        const cleaned: StaffRoleGroup = {
          id: row.id,
          name: row.name,
          description: typeof row.description === "string" ? row.description : undefined,
          roles: row.roles.filter(isValidStaffRole),
          createdAt: typeof row.createdAt === "string" ? row.createdAt : new Date().toISOString(),
          updatedAt: typeof row.updatedAt === "string" ? row.updatedAt : new Date().toISOString(),
        };
        return cleaned;
      });
  } catch {
    return [];
  }
}

export function loadRoleGroups(): StaffRoleGroup[] {
  return safeParse(localStorage.getItem(STORAGE_KEY));
}

function persistGroups(groups: StaffRoleGroup[]) {
  const payload = JSON.stringify(groups);
  for (let step = 0; step < 10; step++) {
    try {
      localStorage.setItem(STORAGE_KEY, payload);
      window.dispatchEvent(new CustomEvent(ROLE_GROUPS_EVENT));
      return;
    } catch (e) {
      if (!isLocalStorageQuotaError(e)) throw e;
      evictSecondaryLocalData(step);
    }
  }
  localStorage.setItem(STORAGE_KEY, payload);
  window.dispatchEvent(new CustomEvent(ROLE_GROUPS_EVENT));
}

export function saveRoleGroups(groups: StaffRoleGroup[]) {
  persistGroups(groups);
}

export function addRoleGroup(input: {
  name: string;
  description?: string;
  roles: ManagedStaffRole[];
}): StaffRoleGroup {
  const now = new Date().toISOString();
  const next: StaffRoleGroup = {
    id: crypto.randomUUID(),
    name: input.name.trim(),
    description: input.description?.trim() || undefined,
    roles: [...new Set(input.roles)],
    createdAt: now,
    updatedAt: now,
  };
  const groups = loadRoleGroups();
  persistGroups([next, ...groups]);
  return next;
}

export function updateRoleGroup(
  id: string,
  patch: Partial<Pick<StaffRoleGroup, "name" | "description" | "roles">>,
): void {
  const groups = loadRoleGroups();
  const updated = groups.map((g) =>
    g.id === id
      ? {
          ...g,
          ...(patch.name != null ? { name: patch.name.trim() } : {}),
          ...(patch.description !== undefined
            ? { description: patch.description?.trim() || undefined }
            : {}),
          ...(patch.roles ? { roles: [...new Set(patch.roles)] } : {}),
          updatedAt: new Date().toISOString(),
        }
      : g,
  );
  persistGroups(updated);
}

export function removeRoleGroup(id: string): void {
  persistGroups(loadRoleGroups().filter((g) => g.id !== id));
}

/**
 * توسيع قائمة من الـIDs (قد تشمل group:<id> و رتب فردية) إلى رتب مفصّلة فريدة.
 * يُستخدم في صفحة المستخدمين لدمج رتب المجموعات مع الرتب الفردية.
 */
export function expandRoleGroupSelection(
  selection: readonly string[],
  groups: readonly StaffRoleGroup[],
): ManagedStaffRole[] {
  const out = new Set<ManagedStaffRole>();
  for (const item of selection) {
    if (item.startsWith("group:")) {
      const gid = item.slice("group:".length);
      const g = groups.find((x) => x.id === gid);
      if (g) g.roles.forEach((r) => out.add(r));
      continue;
    }
    if (isValidStaffRole(item)) out.add(item);
  }
  return [...out];
}

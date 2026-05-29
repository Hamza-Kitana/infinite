import type { StaffRole } from "@/contexts/AuthContext";
import type { ApplicationRecord } from "@/data/publicApplicationTypes";
import {
  INSTITUTION_BRANCH_IDS,
  branchIdFromInstitutionRosterStaffRole,
  institutionRosterStaffRoleForBranch,
  isInstitutionRosterStaffRole,
  type InstitutionBranchId,
} from "@/data/institutionBranches";
import { branchIdFromApplicationRoleKey } from "@/lib/applicationsClosure";
import { isJobApplicationRoleKey } from "@/data/jobRoleLaws";
import { STREAMER_APPLICATION_ROLE } from "@/lib/streamerApplication";

export function canStaffReviewApplication(
  app: ApplicationRecord,
  opts: {
    isSuperAdmin: boolean;
    isApplicationReviewer: boolean;
    userRoles: readonly StaffRole[];
  },
): boolean {
  if (opts.isSuperAdmin || opts.isApplicationReviewer) return true;
  const roles = new Set(opts.userRoles);
  if (app.roleKey === "ems") return roles.has(institutionRosterStaffRoleForBranch("health"));
  if (app.roleKey === "police") return roles.has(institutionRosterStaffRoleForBranch("interior_police"));
  if (app.roleKey === "interior_sheriff") return roles.has(institutionRosterStaffRoleForBranch("interior_sheriff"));
  if (app.roleKey === "interior_cia") return roles.has(institutionRosterStaffRoleForBranch("interior_cia"));
  if (app.roleKey === "interior_marines") return roles.has(institutionRosterStaffRoleForBranch("interior_marines"));
  if (app.roleKey === "interior_fpi") return roles.has(institutionRosterStaffRoleForBranch("interior_fpi"));
  if (app.roleKey === "oversight") return roles.has(institutionRosterStaffRoleForBranch("oversight"));
  if (app.roleKey === "lawyer" || app.roleKey === "justice") {
    return roles.has(institutionRosterStaffRoleForBranch("justice_lawyers"));
  }
  if (app.roleKey === "developer") return roles.has(institutionRosterStaffRoleForBranch("developer"));
  if (app.roleKey === "streamers") return roles.has("streamer_manager");
  return false;
}

/** طلبات دخول السيرفر والتقديم العام — بدون توظيف /jobs */
export function countPendingServerApplicationsForStaff(
  applications: ApplicationRecord[],
  opts: {
    isSuperAdmin: boolean;
    isApplicationReviewer: boolean;
    userRoles: readonly StaffRole[];
  },
): number {
  return applications.filter(
    (a) =>
      a.status === "pending" &&
      !isJobApplicationRoleKey(a.roleKey) &&
      a.roleKey !== STREAMER_APPLICATION_ROLE &&
      canStaffReviewApplication(a, opts),
  ).length;
}

/** فروع المؤسسات التي يديرها الموظف (لطلبات التوظيف) */
export function staffInstitutionBranchIds(opts: {
  isSuperAdmin: boolean;
  userRoles: readonly StaffRole[];
}): InstitutionBranchId[] {
  if (opts.isSuperAdmin) return [...INSTITUTION_BRANCH_IDS];
  const ids: InstitutionBranchId[] = [];
  for (const role of opts.userRoles) {
    if (!isInstitutionRosterStaffRole(role)) continue;
    const branchId = branchIdFromInstitutionRosterStaffRole(role);
    if (branchId) ids.push(branchId);
  }
  return [...new Set(ids)];
}

/** طلبات التوظيف من /jobs — تُراجع من محرر طاقم المؤسسة */
export function countPendingJobApplicationsForBranch(
  applications: ApplicationRecord[],
  branchId: InstitutionBranchId,
): number {
  return applications.filter((a) => {
    if (a.status !== "pending" || !isJobApplicationRoleKey(a.roleKey)) return false;
    return branchIdFromApplicationRoleKey(a.roleKey) === branchId;
  }).length;
}

/** عدد طلبات التوظيف المعلّقة لكل فرع مؤسسي */
export function pendingJobApplicationsCountByBranch(
  applications: ApplicationRecord[],
  branchIds: readonly InstitutionBranchId[],
): Map<InstitutionBranchId, number> {
  const map = new Map<InstitutionBranchId, number>();
  for (const id of branchIds) map.set(id, 0);

  for (const app of applications) {
    if (app.status !== "pending" || !isJobApplicationRoleKey(app.roleKey)) continue;
    const branchId = branchIdFromApplicationRoleKey(app.roleKey);
    if (branchId == null || !map.has(branchId)) continue;
    map.set(branchId, (map.get(branchId) ?? 0) + 1);
  }

  return map;
}

/** طلبات التوظيف من /jobs — تُراجع من محرر طاقم المؤسسة */
export function countPendingJobApplicationsForStaff(
  applications: ApplicationRecord[],
  opts: {
    isSuperAdmin: boolean;
    userRoles: readonly StaffRole[];
  },
): number {
  const branches = staffInstitutionBranchIds(opts);
  if (branches.length === 0) return 0;

  const byBranch = pendingJobApplicationsCountByBranch(applications, branches);
  let total = 0;
  for (const count of byBranch.values()) total += count;
  return total;
}

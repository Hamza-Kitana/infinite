import type { InstitutionBranchId } from "@/data/institutionBranches";
import type { JobRoleKey } from "@/data/jobRoleLaws";
import { branchIdFromApplicationRoleKey } from "@/lib/applicationsClosure";

/** مفتاح التقديم الوظيفي المرتبط بفرع مؤسسة (فرع واحد ← دور واحد في الغالب) */
export function jobRoleKeyFromInstitutionBranch(branchId: InstitutionBranchId): JobRoleKey | null {
  const map: Record<InstitutionBranchId, JobRoleKey> = {
    health: "ems",
    interior_police: "police",
    interior_sheriff: "interior_sheriff",
    interior_cia: "interior_cia",
    interior_marines: "interior_marines",
    interior_fpi: "interior_fpi",
    oversight: "oversight",
    justice_lawyers: "lawyer",
    developer: "developer",
  };
  return map[branchId] ?? null;
}

export function institutionBranchFromJobRoleKey(roleKey: JobRoleKey): InstitutionBranchId | null {
  return branchIdFromApplicationRoleKey(roleKey);
}

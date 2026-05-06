/** فروع المؤسسات التي لها طاقم (InstitutionRoster) قابل للتحرير منفصل لكل فرع */

export const INSTITUTION_BRANCH_IDS = [
  "health",
  "interior_police",
  "interior_sheriff",
  "interior_cia",
  "interior_marines",
  "oversight",
  "justice_lawyers",
  "developer",
] as const;

export type InstitutionBranchId = (typeof INSTITUTION_BRANCH_IDS)[number];

export function isInstitutionBranchId(v: string): v is InstitutionBranchId {
  return (INSTITUTION_BRANCH_IDS as readonly string[]).includes(v);
}

export const INSTITUTION_BRANCH_META: Record<
  InstitutionBranchId,
  { labelAr: string; previewPath: string }
> = {
  health: { labelAr: "وزارة الصحة", previewPath: "/health" },
  interior_police: { labelAr: "وزارة الداخلية — الشرطة", previewPath: "/interior/police" },
  interior_sheriff: { labelAr: "وزارة الداخلية — الشيرف", previewPath: "/interior/sheriff" },
  interior_cia: { labelAr: "وزارة الداخلية — CIA", previewPath: "/interior/cia" },
  interior_marines: { labelAr: "وزارة الداخلية — المارينز", previewPath: "/interior/marines" },
  oversight: { labelAr: "مؤسسة الرقابة", previewPath: "/oversight" },
  justice_lawyers: { labelAr: "وزارة العدل — هيئة المحاماة", previewPath: "/justice#lawyers" },
  developer: { labelAr: "مؤسسة المبرمجين", previewPath: "/developer" },
};

/** دور موظف واحد لكل فرع — يحرّر طاقم ذلك الفرع فقط (بدل «مدير فرع + قائمة») */
export type InstitutionRosterStaffRole = `institution_roster_${InstitutionBranchId}`;

const ROSTER_PREFIX = "institution_roster_" as const;

export function institutionRosterStaffRoleForBranch(id: InstitutionBranchId): InstitutionRosterStaffRole {
  return `${ROSTER_PREFIX}${id}` as InstitutionRosterStaffRole;
}

export function branchIdFromInstitutionRosterStaffRole(role: string): InstitutionBranchId | null {
  if (!role.startsWith(ROSTER_PREFIX)) return null;
  const id = role.slice(ROSTER_PREFIX.length);
  return isInstitutionBranchId(id) ? id : null;
}

export function isInstitutionRosterStaffRole(role: string): role is InstitutionRosterStaffRole {
  return branchIdFromInstitutionRosterStaffRole(role) !== null;
}

export const INSTITUTION_ROSTER_STAFF_ROLES: InstitutionRosterStaffRole[] = INSTITUTION_BRANCH_IDS.map((id) =>
  institutionRosterStaffRoleForBranch(id),
);

/** عنوان عرض للدور في قوائم المستخدمين */
export function institutionRosterStaffRoleLabelAr(role: InstitutionRosterStaffRole): string {
  const id = branchIdFromInstitutionRosterStaffRole(role);
  if (!id) return role;
  if (id === "oversight") return "مدير الرقابة";
  return `مدير طاقم — ${INSTITUTION_BRANCH_META[id].labelAr}`;
}

/** فروع الطاقم المذكورة صراحةً في قائمة الأدوار */
export function institutionRosterBranchIdsFromRoleList(roles: readonly string[]): InstitutionBranchId[] {
  const ids = roles
    .map((r) => branchIdFromInstitutionRosterStaffRole(r))
    .filter((x): x is InstitutionBranchId => x != null);
  return [...new Set(ids)];
}

import { INSTITUTION_BRANCH_IDS, type InstitutionBranchId } from "@/data/institutionBranches";
import { emptyInstitutionRoster, type InstitutionRosterData } from "@/data/institutionRosters";

export type InstitutionRostersPersisted = {
  v: 2;
  rosters: Record<InstitutionBranchId, InstitutionRosterData>;
};

function deepClone<T>(x: T): T {
  return JSON.parse(JSON.stringify(x)) as T;
}

export function defaultInstitutionRostersPersisted(): InstitutionRostersPersisted {
  const empty = emptyInstitutionRoster();
  return {
    v: 2,
    rosters: Object.fromEntries(
      INSTITUTION_BRANCH_IDS.map((id) => [id, deepClone(empty)]),
    ) as Record<InstitutionBranchId, InstitutionRosterData>,
  };
}

export function defaultRosterForBranch(id: InstitutionBranchId): InstitutionRosterData {
  return deepClone(defaultInstitutionRostersPersisted().rosters[id]);
}

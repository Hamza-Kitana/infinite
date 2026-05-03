import type { InstitutionBranchId } from "@/data/institutionBranches";
import type { InstitutionRosterData } from "@/data/institutionRosters";
import {
  ciaDepartmentRoster,
  developerRoster,
  healthRoster,
  interiorMinistryOverview,
  lawyerRoster,
  marinesDepartmentRoster,
  oversightRoster,
  policeDepartmentRoster,
  sheriffDepartmentRoster,
} from "@/data/institutionRosters";

export type InstitutionRostersPersisted = {
  v: 1;
  rosters: Record<InstitutionBranchId, InstitutionRosterData>;
};

function deepClone<T>(x: T): T {
  return JSON.parse(JSON.stringify(x)) as T;
}

export function defaultInstitutionRostersPersisted(): InstitutionRostersPersisted {
  return {
    v: 1,
    rosters: {
      health: deepClone(healthRoster),
      interior_hub: deepClone(interiorMinistryOverview),
      interior_police: deepClone(policeDepartmentRoster),
      interior_sheriff: deepClone(sheriffDepartmentRoster),
      interior_cia: deepClone(ciaDepartmentRoster),
      interior_marines: deepClone(marinesDepartmentRoster),
      oversight: deepClone(oversightRoster),
      justice_lawyers: deepClone(lawyerRoster),
      developer: deepClone(developerRoster),
    },
  };
}

export function defaultRosterForBranch(id: InstitutionBranchId): InstitutionRosterData {
  return deepClone(defaultInstitutionRostersPersisted().rosters[id]);
}

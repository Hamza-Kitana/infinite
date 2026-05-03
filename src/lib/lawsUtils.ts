import type { LawTabSection } from "@/types/lawsSchema";

export function sectionItemCount(s: LawTabSection): number {
  if (s.kind === "rules") return s.rules.length;
  const b = s.penalties;
  return (
    b.warningLevels.length +
    b.specificPenalties.length +
    b.robberyPeopleRules.length +
    b.directPoliceUnitsRules.length +
    b.safeZones.length
  );
}

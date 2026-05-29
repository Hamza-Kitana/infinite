import type { ChromaGridItem } from "@/components/ChromaGrid";
import type { RosterPerson } from "@/components/InstitutionRoster";

export type InstitutionRosterData = {
  leader: RosterPerson;
  deputy: RosterPerson;
  members: (ChromaGridItem & { hidden?: boolean })[];
};

const emptyLeaderOrDeputy = (): RosterPerson => ({
  name: "",
  title: "",
  image: "/placeholder.svg",
  bio: "",
  hidden: true,
});

/** طاقم فارغ — تُعبّأ البيانات من لوحة الإدارة */
export function emptyInstitutionRoster(): InstitutionRosterData {
  return {
    leader: emptyLeaderOrDeputy(),
    deputy: emptyLeaderOrDeputy(),
    members: [],
  };
}

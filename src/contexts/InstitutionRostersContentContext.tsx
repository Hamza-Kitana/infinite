import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { ChromaGridItem } from "@/components/ChromaGrid";
import {
  INSTITUTION_BRANCH_IDS,
  type InstitutionBranchId,
} from "@/data/institutionBranches";
import type { InstitutionRosterData } from "@/data/institutionRosters";
import type { RosterPerson } from "@/components/InstitutionRoster";
import {
  defaultInstitutionRostersPersisted,
  type InstitutionRostersPersisted,
} from "@/data/institutionRostersDefaultState";
import { listenStorageSync, writeSyncedLocalStorage } from "@/lib/storageSync";

const STORAGE_KEY = "ic_institution_rosters_v1";

function hydrate(partial: unknown): InstitutionRostersPersisted {
  const base = defaultInstitutionRostersPersisted();
  if (
    partial &&
    typeof partial === "object" &&
    (partial as InstitutionRostersPersisted).v === 1 &&
    typeof (partial as InstitutionRostersPersisted).rosters === "object" &&
    (partial as InstitutionRostersPersisted).rosters !== null
  ) {
    return { v: 1, rosters: { ...base.rosters, ...(partial as InstitutionRostersPersisted).rosters } };
  }
  return base;
}

function loadPersisted(): InstitutionRostersPersisted {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultInstitutionRostersPersisted();
    return hydrate(JSON.parse(raw));
  } catch {
    return defaultInstitutionRostersPersisted();
  }
}

const INSTITUTION_ROSTERS_CHANGED_EVENT = "ic-institution-rosters-changed";

function emptyRosterPerson(): RosterPerson {
  return { name: "", title: "", image: "", bio: "" };
}

function isLeadershipSlotOccupied(p: RosterPerson): boolean {
  if (p.userId) return true;
  return !!p.name && p.name.trim().length > 1;
}

function rosterPersonToMember(p: RosterPerson, rankFallback: string): ChromaGridItem {
  return {
    image: p.image || "/placeholder.svg",
    title: p.name?.trim() || "—",
    subtitle: p.title?.trim() || rankFallback,
    rankLabel: p.title?.trim() || rankFallback,
    bio: p.bio,
    userId: p.userId,
    discordId: p.discordId,
    borderColor: "#22D3EE",
    gradient: "linear-gradient(145deg, #0e7490, #000)",
  };
}

/** ينقل شاغل منصب القائد/النائب إلى أعضاء الشبكة ويفرغ المنصب */
function moveSlotOccupantToMembers(
  roster: InstitutionRosterData,
  slot: "leader" | "deputy",
  rankFallback: string,
): InstitutionRosterData {
  const occupant = roster[slot];
  if (!isLeadershipSlotOccupied(occupant)) {
    return { ...roster, [slot]: emptyRosterPerson() };
  }
  return {
    ...roster,
    [slot]: emptyRosterPerson(),
    members: [rosterPersonToMember(occupant, rankFallback), ...roster.members],
  };
}

function savePersisted(data: InstitutionRostersPersisted) {
  writeSyncedLocalStorage(STORAGE_KEY, JSON.stringify(data), [INSTITUTION_ROSTERS_CHANGED_EVENT]);
}

/** نوع رتبة الفرد داخل طاقم المؤسسة */
export type RosterMembershipRole = "leader" | "deputy" | "member";

/** نتيجة بحث عن عضوية مستخدم في طاقم */
export type UserMembership = {
  branchId: InstitutionBranchId;
  role: RosterMembershipRole;
  /** مرجعية مفيدة للبحث (الاسم في الطاقم) */
  displayName: string;
  /** صورة العضو */
  image: string;
  /** نص الرتبة الإدارية للعضو (للأعضاء فقط) */
  rankLabel?: string;
};

/** بيانات بدء أو تحديث عضو من تقديم */
export type AssignFromApplicationInput = {
  branchId: InstitutionBranchId;
  role: RosterMembershipRole;
  /** الاسم النهائي الذي يحدده الأدمن (افتراضياً اسم المدينة) */
  name: string;
  /** نص الرتبة (مثال: ضابط مرور / رقيب / مسعف) */
  rankLabel: string;
  /** صورة الشخصية النهائية (Data URL أو رابط) */
  image: string;
  /** نبذة عن الشخص */
  bio?: string;
  /** سطر توضيحي تحت المنصب (للقائد/النائب فقط) */
  tagline?: string;
  /** PublicUser.id المرتبط */
  userId?: string;
  /** Discord ID */
  discordId?: string;
  /** لون حافة بطاقة العضو (للأعضاء فقط) */
  borderColor?: string;
  /** خلفية gradient بطاقة العضو (للأعضاء فقط) */
  gradient?: string;
};

type InstitutionRostersContentValue = {
  getBranchRoster: (id: InstitutionBranchId) => InstitutionRosterData;
  setBranchRoster: (id: InstitutionBranchId, roster: InstitutionRosterData) => void;
  resetBranchToDefault: (id: InstitutionBranchId) => void;
  resetAllToDefaults: () => void;
  /** ابحث عن عضوية مستخدم في كل الفروع (priority: leader > deputy > member) */
  findMembershipForUser: (userId: string | undefined | null) => UserMembership | null;
  /**
   * تعيين متقدم في الطاقم بدور leader/deputy/member.
   * يرجع `leader_conflict` إذا حاول تعيين قائد ووجد قائد قائم.
   */
  assignFromApplication: (
    input: AssignFromApplicationInput,
  ) => "ok" | "leader_conflict" | "deputy_conflict" | "not_found";
  /** تحديث رتبة عضو موجود (يمكن تحريك القائد ↔ النائب ↔ عضو) */
  promoteMember: (
    branchId: InstitutionBranchId,
    targetUserIdOrIndex: { userId?: string; memberIndex?: number },
    newRole: RosterMembershipRole,
    rankLabel?: string,
  ) => "ok" | "leader_conflict" | "deputy_conflict" | "not_found";
  /** تحديث بيانات عضو في الـmembers grid */
  updateMember: (
    branchId: InstitutionBranchId,
    memberIndex: number,
    patch: Partial<ChromaGridItem>,
  ) => void;
  /** إزالة عضو من الـmembers grid */
  removeMember: (branchId: InstitutionBranchId, memberIndex: number) => void;
  /** إفراغ منصب قائد/نائب (ينقل الشاغل الحالي إلى الأعضاء إن وُجد) */
  vacateLeadershipSlot: (
    branchId: InstitutionBranchId,
    slot: "leader" | "deputy",
    demotedRankLabel?: string,
  ) => "ok" | "not_found";
};

const InstitutionRostersContentContext = createContext<InstitutionRostersContentValue | null>(null);

export function InstitutionRostersContentProvider({ children }: { children: ReactNode }) {
  const [persisted, setPersisted] = useState<InstitutionRostersPersisted>(() => loadPersisted());

  useEffect(() => {
    return listenStorageSync(STORAGE_KEY, () => setPersisted(loadPersisted()), [
      INSTITUTION_ROSTERS_CHANGED_EVENT,
    ]);
  }, []);

  const getBranchRoster = useCallback(
    (id: InstitutionBranchId) => persisted.rosters[id],
    [persisted.rosters],
  );

  const setBranchRoster = useCallback((id: InstitutionBranchId, roster: InstitutionRosterData) => {
    setPersisted((prev) => {
      const next: InstitutionRostersPersisted = {
        v: 1,
        rosters: { ...prev.rosters, [id]: JSON.parse(JSON.stringify(roster)) as InstitutionRosterData },
      };
      savePersisted(next);
      return next;
    });
  }, []);

  const resetBranchToDefault = useCallback((id: InstitutionBranchId) => {
    setPersisted((prev) => {
      const def = defaultInstitutionRostersPersisted().rosters[id];
      const next: InstitutionRostersPersisted = {
        v: 1,
        rosters: { ...prev.rosters, [id]: JSON.parse(JSON.stringify(def)) as InstitutionRosterData },
      };
      savePersisted(next);
      return next;
    });
  }, []);

  const resetAllToDefaults = useCallback(() => {
    const next = defaultInstitutionRostersPersisted();
    savePersisted(next);
    setPersisted(next);
  }, []);

  /** ابحث عن عضوية مستخدم في أي فرع — priority: leader > deputy > member */
  const findMembershipForUser = useCallback(
    (userId: string | undefined | null): UserMembership | null => {
      if (!userId) return null;
      for (const branchId of INSTITUTION_BRANCH_IDS) {
        const r = persisted.rosters[branchId];
        if (!r) continue;
        if (r.leader.userId === userId) {
          return {
            branchId,
            role: "leader",
            displayName: r.leader.name,
            image: r.leader.image,
            rankLabel: r.leader.title,
          };
        }
        if (r.deputy.userId === userId) {
          return {
            branchId,
            role: "deputy",
            displayName: r.deputy.name,
            image: r.deputy.image,
            rankLabel: r.deputy.title,
          };
        }
        const memberIdx = r.members.findIndex((m) => m.userId === userId);
        if (memberIdx >= 0) {
          const m = r.members[memberIdx];
          return {
            branchId,
            role: "member",
            displayName: m.title,
            image: m.image,
            rankLabel: m.rankLabel ?? m.subtitle,
          };
        }
      }
      return null;
    },
    [persisted.rosters],
  );

  const isSlotOccupied = useCallback((p: RosterPerson): boolean => isLeadershipSlotOccupied(p), []);

  const assignFromApplication = useCallback(
    (input: AssignFromApplicationInput): "ok" | "leader_conflict" | "deputy_conflict" | "not_found" => {
      const current = persisted.rosters[input.branchId];
      if (!current) return "not_found";

      let rosterBase = current;
      if (input.role === "leader" && isSlotOccupied(rosterBase.leader)) {
        rosterBase = moveSlotOccupantToMembers(
          rosterBase,
          "leader",
          rosterBase.leader.title || "قائد سابق",
        );
      }
      if (input.role === "deputy" && isSlotOccupied(rosterBase.deputy)) {
        rosterBase = moveSlotOccupantToMembers(
          rosterBase,
          "deputy",
          rosterBase.deputy.title || "نائب سابق",
        );
      }

      const next: InstitutionRosterData =
        input.role === "leader"
          ? {
              ...rosterBase,
              leader: {
                name: input.name,
                title: input.rankLabel || "قائد المؤسسة",
                image: input.image,
                bio: input.bio ?? "",
                tagline: input.tagline,
                highlights: rosterBase.leader.highlights,
                userId: input.userId,
                discordId: input.discordId,
              },
            }
          : input.role === "deputy"
            ? {
                ...rosterBase,
                deputy: {
                  name: input.name,
                  title: input.rankLabel || "نائب القائد",
                  image: input.image,
                  bio: input.bio ?? "",
                  tagline: input.tagline,
                  highlights: rosterBase.deputy.highlights,
                  userId: input.userId,
                  discordId: input.discordId,
                },
              }
            : (() => {
                /** فحص — لو نفس userId موجود سابقاً، نحدّث بدل التكرار */
                const existingIdx = input.userId
                  ? rosterBase.members.findIndex((m) => m.userId === input.userId)
                  : -1;
                const memberPayload: ChromaGridItem = {
                  image: input.image,
                  title: input.name,
                  subtitle: input.rankLabel || "عضو جديد",
                  rankLabel: input.rankLabel || "عضو",
                  bio: input.bio,
                  userId: input.userId,
                  discordId: input.discordId,
                  borderColor: input.borderColor ?? "#22D3EE",
                  gradient: input.gradient ?? "linear-gradient(145deg, #0e7490, #000)",
                };
                if (existingIdx >= 0) {
                  const updated = [...rosterBase.members];
                  updated[existingIdx] = { ...updated[existingIdx], ...memberPayload };
                  return { ...rosterBase, members: updated };
                }
                return { ...rosterBase, members: [...rosterBase.members, memberPayload] };
              })();

      setPersisted((prev) => {
        const out: InstitutionRostersPersisted = {
          v: 1,
          rosters: { ...prev.rosters, [input.branchId]: next },
        };
        savePersisted(out);
        return out;
      });
      return "ok";
    },
    [persisted.rosters, isSlotOccupied],
  );

  const promoteMember = useCallback(
    (
      branchId: InstitutionBranchId,
      target: { userId?: string; memberIndex?: number },
      newRole: RosterMembershipRole,
      rankLabel?: string,
    ): "ok" | "leader_conflict" | "deputy_conflict" | "not_found" => {
      const current = persisted.rosters[branchId];
      if (!current) return "not_found";

      let person: ChromaGridItem | RosterPerson | null = null;
      let removeMemberIdx = -1;
      let demotedFromLeader = false;
      let demotedFromDeputy = false;

      if (target.userId) {
        if (current.leader.userId === target.userId) {
          person = current.leader;
          demotedFromLeader = true;
        } else if (current.deputy.userId === target.userId) {
          person = current.deputy;
          demotedFromDeputy = true;
        } else {
          const idx = current.members.findIndex((m) => m.userId === target.userId);
          if (idx >= 0) {
            person = current.members[idx];
            removeMemberIdx = idx;
          }
        }
      } else if (typeof target.memberIndex === "number") {
        if (target.memberIndex >= 0 && target.memberIndex < current.members.length) {
          person = current.members[target.memberIndex];
          removeMemberIdx = target.memberIndex;
        }
      }
      if (!person) return "not_found";

      let working = current;

      if (demotedFromLeader) {
        working = { ...working, leader: emptyRosterPerson() };
      } else if (demotedFromDeputy) {
        working = { ...working, deputy: emptyRosterPerson() };
      }

      if (removeMemberIdx >= 0) {
        working = {
          ...working,
          members: working.members.filter((_, i) => i !== removeMemberIdx),
        };
      }

      if (newRole === "leader" && !demotedFromLeader && isSlotOccupied(working.leader)) {
        working = moveSlotOccupantToMembers(working, "leader", working.leader.title || "قائد سابق");
      }
      if (newRole === "deputy" && !demotedFromDeputy && isSlotOccupied(working.deputy)) {
        working = moveSlotOccupantToMembers(working, "deputy", working.deputy.title || "نائب سابق");
      }

      const userId = "userId" in person ? person.userId : undefined;
      const discordId = "discordId" in person ? person.discordId : undefined;
      const image = person.image;
      const name = "name" in person ? person.name : person.title;
      const bio = "bio" in person ? person.bio : undefined;

      let nextRoster: InstitutionRosterData = working;

      const finalRankLabel = rankLabel ?? ("rankLabel" in person ? person.rankLabel : undefined);

      if (newRole === "leader") {
        nextRoster = {
          ...nextRoster,
          leader: {
            name,
            title: finalRankLabel || "قائد المؤسسة",
            image,
            bio: bio ?? "",
            userId,
            discordId,
            tagline: "tagline" in person ? person.tagline : undefined,
            highlights:
              "highlights" in person && person.highlights ? [...person.highlights] : undefined,
          },
        };
      } else if (newRole === "deputy") {
        nextRoster = {
          ...nextRoster,
          deputy: {
            name,
            title: finalRankLabel || "نائب القائد",
            image,
            bio: bio ?? "",
            userId,
            discordId,
            tagline: "tagline" in person ? person.tagline : undefined,
            highlights:
              "highlights" in person && person.highlights ? [...person.highlights] : undefined,
          },
        };
      } else {
        const memberPayload: ChromaGridItem = {
          image,
          title: name,
          subtitle: finalRankLabel || "عضو",
          rankLabel: finalRankLabel || "عضو",
          bio,
          userId,
          discordId,
          borderColor: "borderColor" in person ? person.borderColor : "#22D3EE",
          gradient: "gradient" in person ? person.gradient : "linear-gradient(145deg, #0e7490, #000)",
        };
        nextRoster = { ...nextRoster, members: [memberPayload, ...nextRoster.members] };
      }

      setPersisted((prev) => {
        const out: InstitutionRostersPersisted = {
          v: 1,
          rosters: { ...prev.rosters, [branchId]: nextRoster },
        };
        savePersisted(out);
        return out;
      });
      return "ok";
    },
    [persisted.rosters, isSlotOccupied],
  );

  const updateMember = useCallback(
    (branchId: InstitutionBranchId, memberIndex: number, patch: Partial<ChromaGridItem>) => {
      setPersisted((prev) => {
        const r = prev.rosters[branchId];
        if (!r || memberIndex < 0 || memberIndex >= r.members.length) return prev;
        const members = [...r.members];
        members[memberIndex] = { ...members[memberIndex], ...patch };
        const next: InstitutionRostersPersisted = {
          v: 1,
          rosters: { ...prev.rosters, [branchId]: { ...r, members } },
        };
        savePersisted(next);
        return next;
      });
    },
    [],
  );

  const vacateLeadershipSlot = useCallback(
    (
      branchId: InstitutionBranchId,
      slot: "leader" | "deputy",
      demotedRankLabel?: string,
    ): "ok" | "not_found" => {
      const current = persisted.rosters[branchId];
      if (!current) return "not_found";
      const fallback =
        demotedRankLabel?.trim() ||
        (slot === "leader" ? current.leader.title || "قائد سابق" : current.deputy.title || "نائب سابق");
      const next = moveSlotOccupantToMembers(current, slot, fallback);
      setPersisted((prev) => {
        const out: InstitutionRostersPersisted = {
          v: 1,
          rosters: { ...prev.rosters, [branchId]: next },
        };
        savePersisted(out);
        return out;
      });
      return "ok";
    },
    [persisted.rosters],
  );

  const removeMember = useCallback((branchId: InstitutionBranchId, memberIndex: number) => {
    setPersisted((prev) => {
      const r = prev.rosters[branchId];
      if (!r || memberIndex < 0 || memberIndex >= r.members.length) return prev;
      const next: InstitutionRostersPersisted = {
        v: 1,
        rosters: {
          ...prev.rosters,
          [branchId]: { ...r, members: r.members.filter((_, i) => i !== memberIndex) },
        },
      };
      savePersisted(next);
      return next;
    });
  }, []);

  const value = useMemo<InstitutionRostersContentValue>(
    () => ({
      getBranchRoster,
      setBranchRoster,
      resetBranchToDefault,
      resetAllToDefaults,
      findMembershipForUser,
      assignFromApplication,
      promoteMember,
      updateMember,
      removeMember,
      vacateLeadershipSlot,
    }),
    [
      getBranchRoster,
      setBranchRoster,
      resetBranchToDefault,
      resetAllToDefaults,
      findMembershipForUser,
      assignFromApplication,
      promoteMember,
      updateMember,
      removeMember,
      vacateLeadershipSlot,
    ],
  );

  return (
    <InstitutionRostersContentContext.Provider value={value}>{children}</InstitutionRostersContentContext.Provider>
  );
}

export function useInstitutionRostersContent(): InstitutionRostersContentValue {
  const ctx = useContext(InstitutionRostersContentContext);
  if (!ctx) throw new Error("useInstitutionRostersContent يجب أن يُستخدم داخل InstitutionRostersContentProvider");
  return ctx;
}

/** للصفحات العامة — يعيد طاقم الفرع الحالي من التخزين */
export function useInstitutionRoster(branchId: InstitutionBranchId): InstitutionRosterData {
  return useInstitutionRostersContent().getBranchRoster(branchId);
}

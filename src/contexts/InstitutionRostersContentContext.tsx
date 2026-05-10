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

function savePersisted(data: InstitutionRostersPersisted) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
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
  ) => "ok" | "leader_conflict" | "deputy_conflict";
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
};

const InstitutionRostersContentContext = createContext<InstitutionRostersContentValue | null>(null);

export function InstitutionRostersContentProvider({ children }: { children: ReactNode }) {
  const [persisted, setPersisted] = useState<InstitutionRostersPersisted>(() => loadPersisted());

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key !== STORAGE_KEY || e.newValue == null) return;
      try {
        setPersisted(hydrate(JSON.parse(e.newValue)));
      } catch {
        /* ignore */
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
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

  /** يحدد ما إذا كان مكان القائد/النائب "مشغولاً" بشخص حقيقي (ليس placeholder افتراضياً) */
  const isSlotOccupied = useCallback((p: RosterPerson): boolean => {
    if (p.userId) return true;
    return !!p.name && p.name.trim().length > 1;
  }, []);

  const assignFromApplication = useCallback(
    (input: AssignFromApplicationInput): "ok" | "leader_conflict" | "deputy_conflict" => {
      const current = persisted.rosters[input.branchId];
      if (!current) return "ok";

      if (input.role === "leader" && isSlotOccupied(current.leader)) {
        return "leader_conflict";
      }
      if (input.role === "deputy" && isSlotOccupied(current.deputy)) {
        return "deputy_conflict";
      }

      const next: InstitutionRosterData =
        input.role === "leader"
          ? {
              ...current,
              leader: {
                name: input.name,
                title: input.rankLabel || "قائد المؤسسة",
                image: input.image,
                bio: input.bio ?? "",
                tagline: input.tagline,
                highlights: current.leader.highlights,
                userId: input.userId,
                discordId: input.discordId,
              },
            }
          : input.role === "deputy"
            ? {
                ...current,
                deputy: {
                  name: input.name,
                  title: input.rankLabel || "نائب القائد",
                  image: input.image,
                  bio: input.bio ?? "",
                  tagline: input.tagline,
                  highlights: current.deputy.highlights,
                  userId: input.userId,
                  discordId: input.discordId,
                },
              }
            : (() => {
                /** فحص — لو نفس userId موجود سابقاً، نحدّث بدل التكرار */
                const existingIdx = input.userId
                  ? current.members.findIndex((m) => m.userId === input.userId)
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
                  const updated = [...current.members];
                  updated[existingIdx] = { ...updated[existingIdx], ...memberPayload };
                  return { ...current, members: updated };
                }
                return { ...current, members: [memberPayload, ...current.members] };
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

      if (newRole === "leader" && !demotedFromLeader && isSlotOccupied(current.leader)) {
        return "leader_conflict";
      }
      if (newRole === "deputy" && !demotedFromDeputy && isSlotOccupied(current.deputy)) {
        return "deputy_conflict";
      }

      const userId = "userId" in person ? person.userId : undefined;
      const discordId = "discordId" in person ? person.discordId : undefined;
      const image = person.image;
      const name = "name" in person ? person.name : person.title;
      const bio = "bio" in person ? person.bio : undefined;

      let nextRoster: InstitutionRosterData = current;

      // إذا كان قادماً من القائد/النائب، نفرغ مكانه
      if (demotedFromLeader) {
        nextRoster = {
          ...nextRoster,
          leader: { name: "", title: "", image: "", bio: "" },
        };
      }
      if (demotedFromDeputy) {
        nextRoster = {
          ...nextRoster,
          deputy: { name: "", title: "", image: "", bio: "" },
        };
      }
      // إذا كان من الأعضاء، نزيله من القائمة
      if (removeMemberIdx >= 0) {
        nextRoster = {
          ...nextRoster,
          members: nextRoster.members.filter((_, i) => i !== removeMemberIdx),
        };
      }

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

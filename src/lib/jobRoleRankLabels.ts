import type { JobRoleKey } from "@/data/jobRoleLaws";
import type { RosterMembershipRole } from "@/contexts/InstitutionRostersContentContext";

/** المسمى الافتراضي للعضو عند القبول — يظهر في الطاقم والبروفايل إن لم يُدخل الأدمن رتبة مخصّصة */
export const JOB_ROLE_DEFAULT_MEMBER_RANK_AR: Record<JobRoleKey, string> = {
  ems: "مسعف",
  police: "شرطي",
  interior_sheriff: "شرطي شريف",
  interior_cia: "عميل CIA",
  interior_marines: "مارين",
  interior_fpi: "وكيل FPI",
  oversight: "مراقب",
  lawyer: "محامٍ",
  developer: "مطوّر",
};

export function isJobRoleKey(value: string): value is JobRoleKey {
  return Object.prototype.hasOwnProperty.call(JOB_ROLE_DEFAULT_MEMBER_RANK_AR, value);
}

export function defaultJobMemberRankAr(roleKey: JobRoleKey): string {
  return JOB_ROLE_DEFAULT_MEMBER_RANK_AR[roleKey];
}

const GENERIC_MEMBER_RANKS = new Set(["عضو", "عضو جديد", "—"]);

/** رتبة العرض في البروفايل — تفضّل ما حدده الأدمن، وإلا المسمى الافتراضي للجهة */
export function resolveProfileJobRankLabel(
  roleKey: JobRoleKey,
  rosterRole: RosterMembershipRole | undefined,
  rankLabel?: string | null,
): string {
  const trimmed = rankLabel?.trim();
  if (rosterRole === "leader") return trimmed || "قائد المؤسسة";
  if (rosterRole === "deputy") return trimmed || "نائب القائد";
  if (trimmed && !GENERIC_MEMBER_RANKS.has(trimmed)) return trimmed;
  return defaultJobMemberRankAr(roleKey);
}

/** اقتراح رتبة عند فتح طلب توظيف للقبول (دور عضو) */
export function suggestedMemberRankForAcceptance(
  roleKey: JobRoleKey,
  assignRole: RosterMembershipRole,
): string {
  if (assignRole === "leader") return "قائد المؤسسة";
  if (assignRole === "deputy") return "نائب القائد";
  return defaultJobMemberRankAr(roleKey);
}

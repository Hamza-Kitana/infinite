export type JobRoleKey =
  | "ems"
  | "police"
  | "interior_sheriff"
  | "interior_cia"
  | "interior_marines"
  | "interior_fpi"
  | "oversight"
  | "lawyer"
  | "developer";

export type JobRoleLawSet = {
  title: string;
  subtitle: string;
  rules: string[];
};

const emptyLawSet = (title: string): JobRoleLawSet => ({
  title,
  subtitle: "",
  rules: [],
});

/** قوانين المؤسسات — فارغة افتراضياً؛ تُعبّأ من محرر كل مؤسسة */
export const JOB_ROLE_LAWS: Record<JobRoleKey, JobRoleLawSet> = {
  ems: emptyLawSet("قوانين وزارة الصحة"),
  police: emptyLawSet("قوانين الداخلية — الشرطة"),
  interior_sheriff: emptyLawSet("قوانين الداخلية — الشيرف"),
  interior_cia: emptyLawSet("قوانين الداخلية — CIA"),
  interior_marines: emptyLawSet("قوانين الداخلية — المارينز"),
  interior_fpi: emptyLawSet("قوانين الداخلية — FPI"),
  oversight: emptyLawSet("قوانين مؤسسة الرقابة"),
  lawyer: emptyLawSet("قوانين وزارة العدل — هيئة المحاماة"),
  developer: emptyLawSet("قوانين مؤسسة المبرمجين"),
};

/** طلبات التوظيف من /jobs/apply — تُدار من طواقم المؤسسات وليس من «طلبات التقديم» (دخول السيرفر). */
export function isJobApplicationRoleKey(roleKey: string): boolean {
  return Object.prototype.hasOwnProperty.call(JOB_ROLE_LAWS, roleKey);
}

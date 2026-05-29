import type { JobRoleKey } from "@/data/jobRoleLaws";

/**
 * أسئلة قصيرة بعد قراءة القوانين — للتأكد أن المتقدم اطّلع فعلاً وفهم المبادئ.
 * تظهر بعد ضغط "أقر بالاطلاع" داخل صفحة التقديم الإلكتروني.
 */

export type QuizOption = { id: string; label: string };

export type QuizQuestion = {
  id: string;
  question: string;
  options: QuizOption[];
  /** معرّف الإجابة الصحيحة من بين options[].id */
  correctOptionId: string;
  /** شرح يظهر بعد المحاولة الفاشلة لتعليم المستخدم */
  explanation?: string;
};

/** أسئلة تقديم المواطن — فارغة؛ تُعبّأ من Quiz Manager */
export const CITIZEN_LAWS_QUIZ: QuizQuestion[] = [];

const JOB_ROLE_KEYS: JobRoleKey[] = [
  "ems",
  "police",
  "interior_sheriff",
  "interior_cia",
  "interior_marines",
  "interior_fpi",
  "oversight",
  "lawyer",
  "developer",
];

/** أسئلة اختبار التوظيف لكل مؤسسة — فارغة؛ تُعبّأ من محرر المؤسسة */
export const JOB_ROLE_LAWS_QUIZ: Record<JobRoleKey, QuizQuestion[]> = Object.fromEntries(
  JOB_ROLE_KEYS.map((key) => [key, [] as QuizQuestion[]]),
) as Record<JobRoleKey, QuizQuestion[]>;

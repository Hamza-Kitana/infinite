/** طلب تقديم من الزوار — يُخزَّن محلياً ويُراجع من لوحة التحكم */

/** إجابة واحدة من اختبار قراءة القوانين */
export type LawsQuizAnswer = {
  questionId: string;
  question: string;
  selectedOptionId: string;
  selectedOptionLabel: string;
  correctOptionId: string;
  correctOptionLabel: string;
  isCorrect: boolean;
};

/** نتيجة كاملة لاختبار قراءة القوانين — تظهر للأدمن مع الطلب */
export type LawsQuizResult = {
  /** هل اجتاز كل الأسئلة بشكل صحيح؟ */
  passed: boolean;
  correctCount: number;
  totalQuestions: number;
  /** عدد المحاولات حتى الإقرار/الإرسال */
  attempts: number;
  /** زمن تأكيد الإجابات (ISO) */
  completedAt: string;
  answers: LawsQuizAnswer[];
};

export type ApplicationFormSnapshot = {
  firstName: string;
  lastName: string;
  gender: "male" | "female";
  birthSummaryLine: string;
  ageSummaryLine: string;
  countryCode: string;
  discord: string;
  previousCities: string;
  experience: string;
  lawsAccepted: boolean;
  /** نتيجة اختبار قراءة القوانين — قد تكون passed=false إذا أرسل بعد الرسوب */
  lawsQuizResult?: LawsQuizResult;
  /** اسم الشخصية في المدينة (للتقديم على الوظائف الاحترافي) */
  cityName?: string;
  /** نبذة شخصية مختصرة يكتبها المتقدم (للتقديم الاحترافي) */
  bio?: string;
  /** صورة شخصية اختيارية يرفعها المتقدم — Data URL */
  avatarDataUrl?: string;
  /** Discord ID الخام كما هو من الحساب المتصل (مفيد للأدمن) */
  discordId?: string;
  /** رابط البث (Kick / TikTok / Twitch…) — تقديم صنّاع المحتوى */
  streamUrl?: string;
  /** المسمى على البطاقة (مثال: ستريمر معتمد) */
  streamerCardRole?: string;
};

export type ApplicationStatus = "pending" | "approved" | "rejected";

export type ApplicationRecord = {
  id: string;
  /** مفتاح المسار /apply/:role */
  roleKey: string;
  targetTitle: string;
  applicantUserId?: string;
  applicantUsername?: string;
  applicantDisplayName?: string;
  status: ApplicationStatus;
  submittedAt: string;
  decidedAt?: string;
  decidedBy?: string;
  /** ملاحظة اختيارية من المراجع عند القرار */
  note?: string;
  snapshot: ApplicationFormSnapshot;
};

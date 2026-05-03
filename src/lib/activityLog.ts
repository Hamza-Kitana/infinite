/** سجل نشاط للعرض من السوبر أدمِن — تخزين محلي (تجريبي) */

export type ActivityLogEntry = {
  id: string;
  at: string;
  actor: string;
  action: string;
  detail?: string;
};

const STORAGE_KEY = "ic_activity_log_v1";
const MAX_ENTRIES = 500;

type Persisted = { v: 1; entries: ActivityLogEntry[] };

function loadRaw(): ActivityLogEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const p = JSON.parse(raw) as Persisted;
    if (p?.v === 1 && Array.isArray(p.entries)) return p.entries;
  } catch {
    /* ignore */
  }
  return [];
}

function isQuota(e: unknown): boolean {
  return e instanceof DOMException && (e.name === "QuotaExceededError" || e.code === 22);
}

function saveRaw(entries: ActivityLogEntry[]) {
  let cap = MAX_ENTRIES;
  for (let attempt = 0; attempt < 10; attempt++) {
    const data: Persisted = { v: 1, entries: entries.slice(0, cap) };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      return;
    } catch (e) {
      if (!isQuota(e)) throw e;
      cap = Math.max(8, Math.floor(cap / 2));
    }
  }
}

/** تسجيل حدث (يُستدعى بعد نجاح العمليات) */
export function appendActivityLog(actor: string, action: string, detail?: string) {
  const a = actor.trim() || "—";
  const entry: ActivityLogEntry = {
    id: crypto.randomUUID(),
    at: new Date().toISOString(),
    actor: a,
    action,
    detail: detail?.trim() || undefined,
  };
  const next = [entry, ...loadRaw()].slice(0, MAX_ENTRIES);
  saveRaw(next);
  window.dispatchEvent(new CustomEvent("ic-activity-log"));
}

export function loadActivityLog(): ActivityLogEntry[] {
  return loadRaw();
}

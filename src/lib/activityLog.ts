/** سجل نشاط للعرض من السوبر أدمِن — تخزين محلي (تجريبي) */

import { useEffect, useState } from "react";
import { emitStorageSync } from "@/lib/storageSync";

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
      emitStorageSync(STORAGE_KEY);
      return;
    } catch (e) {
      if (!isQuota(e)) throw e;
      cap = Math.max(8, Math.floor(cap / 2));
    }
  }
}

/** يُرسل بعد كل `appendActivityLog` وبعد تحديث localStorage من تبويب آخر */
export const IC_ACTIVITY_LOG_CHANGED_EVENT = "ic-activity-log";

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
  window.dispatchEvent(new CustomEvent(IC_ACTIVITY_LOG_CHANGED_EVENT));
}

export function loadActivityLog(): ActivityLogEntry[] {
  return loadRaw();
}

/**
 * آخر N سجلات مع إعادة القراءة تلقائياً عند إضافة لوج (نفس التبويب أو آخر عبر storage).
 * للوحة التحكم وغيرها دون الحاجة لتحديث الصفحة يدوياً.
 */
export function useActivityLogPreview(maxEntries: number): ActivityLogEntry[] {
  const [entries, setEntries] = useState<ActivityLogEntry[]>(() => loadRaw().slice(0, maxEntries));
  useEffect(() => {
    const pull = () => setEntries(loadRaw().slice(0, maxEntries));
    window.addEventListener(IC_ACTIVITY_LOG_CHANGED_EVENT, pull);
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) pull();
    };
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener(IC_ACTIVITY_LOG_CHANGED_EVENT, pull);
      window.removeEventListener("storage", onStorage);
    };
  }, [maxEntries]);
  return entries;
}

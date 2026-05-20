/**
 * مزامنة فورية لبيانات localStorage داخل نفس التبويب وللتبويبات الأخرى.
 * حدث `storage` من المتصفح لا يُطلق عند الكتابة من نفس الصفحة — نستخدم CustomEvent.
 */

export const DASHBOARD_LIVE_EVENT = "ic-dashboard-live";

export function storageSyncEvent(storageKey: string): string {
  return `ic:storage:${storageKey}`;
}

export function emitStorageSync(storageKey: string): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(storageSyncEvent(storageKey)));
  window.dispatchEvent(new CustomEvent(DASHBOARD_LIVE_EVENT, { detail: { storageKey } }));
}

/** كتابة + إشعار فوري (+ أحداث legacy إن وُجدت) */
export function writeSyncedLocalStorage(
  storageKey: string,
  value: string,
  legacyEvents: readonly string[] = [],
): void {
  localStorage.setItem(storageKey, value);
  emitStorageSync(storageKey);
  for (const ev of legacyEvents) {
    window.dispatchEvent(new CustomEvent(ev));
  }
}

/**
 * الاستماع لتحديثات مفتاح تخزين — نفس التبويب (قناة مخصصة + legacy) أو تبويب آخر (`storage`).
 */
export function listenStorageSync(
  storageKey: string,
  onChange: () => void,
  legacyEvents: readonly string[] = [],
): () => void {
  const channel = storageSyncEvent(storageKey);
  const handler = () => onChange();
  window.addEventListener(channel, handler);
  for (const ev of legacyEvents) {
    window.addEventListener(ev, handler);
  }
  const onStorage = (e: StorageEvent) => {
    if (e.key === storageKey) onChange();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    window.removeEventListener(channel, handler);
    for (const ev of legacyEvents) {
      window.removeEventListener(ev, handler);
    }
    window.removeEventListener("storage", onStorage);
  };
}

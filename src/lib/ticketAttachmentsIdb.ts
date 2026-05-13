/** تخزين مرفقات التكتات الكبيرة خارج localStorage لتجنب تجاوز الحصّة */

const DB_NAME = "ic_ticket_attachments_v1";
const STORE = "blobs";
const DB_VERSION = 1;

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE);
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error ?? new Error("idb_open"));
  });
}

export async function idbPutTicketBlob(id: string, blob: Blob): Promise<void> {
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error ?? new Error("idb_put"));
    tx.objectStore(STORE).put(blob, id);
  });
  db.close();
}

export async function idbGetTicketBlob(id: string): Promise<Blob | null> {
  const db = await openDb();
  const blob = await new Promise<Blob | null>((resolve, reject) => {
    const tx = db.transaction(STORE, "readonly");
    tx.onerror = () => reject(tx.error ?? new Error("idb_get"));
    const req = tx.objectStore(STORE).get(id);
    req.onsuccess = () => resolve((req.result as Blob | undefined) ?? null);
  });
  db.close();
  return blob;
}

export async function idbDeleteTicketBlob(id: string): Promise<void> {
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error ?? new Error("idb_delete"));
    tx.objectStore(STORE).delete(id);
  });
  db.close();
}

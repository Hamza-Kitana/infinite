import type { TicketAttachment } from "@/lib/ticketsCenter";
import { idbDeleteTicketBlob, idbPutTicketBlob } from "@/lib/ticketAttachmentsIdb";

/** أقصى حجم يُخزَّن داخل JSON التكتات في localStorage — ما فوق يُحفظ في IndexedDB */
export const TICKET_ATTACHMENT_INLINE_MAX_BYTES = 1.25 * 1024 * 1024;

export function formatFileSize(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes < 0) return "—";
  if (bytes < 1024) return `${bytes} بايت`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} ك.ب`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} م.ب`;
}

function readFileAsDataUrl(file: File, onProgress?: (ratio: number) => void): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onprogress = (e) => {
      if (!onProgress || !e.lengthComputable || !e.total) return;
      onProgress(Math.min(1, e.loaded / e.total));
    };
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error ?? new Error("read"));
    reader.readAsDataURL(file);
  });
}

export type ReadTicketAttachmentOptions = {
  onProgress?: (ratio: number) => void;
};

/**
 * يقرأ صورة أو فيديو كمرفق تكت.
 * الملفات الصغيرة تُخزَّن كـ data URL؛ الأكبر تُحفظ في IndexedDB ويُعاد مرجع خفيف.
 */
export async function readTicketAttachmentFromFile(
  file: File,
  options?: ReadTicketAttachmentOptions,
): Promise<TicketAttachment> {
  const id = crypto.randomUUID();
  const name = file.name || "مرفق";
  const mimeType = file.type || "application/octet-stream";

  if (file.size <= TICKET_ATTACHMENT_INLINE_MAX_BYTES) {
    const dataUrl = await readFileAsDataUrl(file, options?.onProgress);
    return { id, name, mimeType, dataUrl };
  }

  options?.onProgress?.(0.05);
  await idbPutTicketBlob(id, file);
  options?.onProgress?.(1);
  return { id, name, mimeType, blobStoreId: id };
}

/** إلغاء مرفق لم يُرسَل بعد (حذف Blob من IDB إن وُجد) */
export async function revokePendingTicketAttachment(att: TicketAttachment | null): Promise<void> {
  if (!att?.blobStoreId) return;
  try {
    await idbDeleteTicketBlob(att.blobStoreId);
  } catch {
    /* ignore */
  }
}

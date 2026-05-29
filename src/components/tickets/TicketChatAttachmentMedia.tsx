import { useEffect, useState } from "react";
import { idbGetTicketBlob } from "@/lib/ticketAttachmentsIdb";
import type { TicketAttachment } from "@/lib/ticketsCenter";
import { cn } from "@/lib/utils";

export type TicketAttachmentChatVariant = "ticketsUser" | "ticketsStaff" | "dashCustomer" | "dashStaff";

const linkTone: Record<TicketAttachmentChatVariant, string> = {
  ticketsUser:
    "border-white/30 bg-white/10 text-violet-100 hover:bg-white/15",
  ticketsStaff:
    "border-violet-200 bg-violet-50 text-violet-700 hover:bg-violet-100 dark:border-slate-600 dark:bg-slate-800 dark:text-violet-200 dark:hover:bg-slate-700",
  dashCustomer:
    "border-violet-200 bg-violet-50 text-violet-800 hover:bg-violet-100 dark:border-slate-600 dark:bg-slate-800 dark:text-violet-200 dark:hover:bg-slate-700",
  dashStaff:
    "border-violet-300 bg-white/80 text-violet-900 hover:bg-violet-50 dark:border-violet-600 dark:bg-violet-950/50 dark:text-violet-100 dark:hover:bg-violet-950/70",
};

const videoBorder: Record<TicketAttachmentChatVariant, string> = {
  ticketsUser: "border-white/30",
  ticketsStaff: "border-violet-200 dark:border-slate-600",
  dashCustomer: "border-violet-200 dark:border-slate-600",
  dashStaff: "border-violet-300 dark:border-violet-600",
};

const previewMaxHeight: Record<TicketAttachmentChatVariant, string> = {
  ticketsUser: "max-h-56",
  ticketsStaff: "max-h-56",
  dashCustomer: "max-h-40",
  dashStaff: "max-h-56",
};

type Props = {
  att: TicketAttachment;
  variant: TicketAttachmentChatVariant;
  /** في نافذة اختيار المرفق — معاينة فقط بدون أزرار فتح/تنزيل */
  compact?: boolean;
};

export function TicketChatAttachmentMedia({ att, variant, compact = false }: Props) {
  const [objectUrl, setObjectUrl] = useState<string | null>(att.dataUrl ?? null);
  const isVideo = att.mimeType.startsWith("video/");

  useEffect(() => {
    if (att.dataUrl) {
      setObjectUrl(att.dataUrl);
      return;
    }
    let cancelled = false;
    let createdUrl: string | null = null;
    const load = async () => {
      if (!att.blobStoreId) return;
      const blob = await idbGetTicketBlob(att.blobStoreId);
      if (!blob || cancelled) return;
      createdUrl = URL.createObjectURL(blob);
      setObjectUrl(createdUrl);
    };
    void load();
    return () => {
      cancelled = true;
      if (createdUrl) URL.revokeObjectURL(createdUrl);
    };
  }, [att.dataUrl, att.blobStoreId]);

  const linkCls = cn("rounded-md border px-2 py-1", linkTone[variant]);

  if (!objectUrl) {
    return <p className="text-[11px] text-violet-200/90 dark:text-slate-400">جارٍ تحميل المرفق…</p>;
  }

  if (isVideo) {
    return (
      <div className="space-y-1">
        <a href={objectUrl} target="_blank" rel="noreferrer" className="block">
          <video
            controls
            className={cn("w-full rounded-lg border bg-slate-100", previewMaxHeight[variant], videoBorder[variant])}
            preload="metadata"
          >
            <source src={objectUrl} type={att.mimeType} />
          </video>
        </a>
        {!compact ? (
          <div className="flex flex-wrap justify-end gap-2 text-[11px]">
            <a href={objectUrl} target="_blank" rel="noreferrer" className={linkCls}>
              فتح
            </a>
            <a href={objectUrl} download={att.name} className={linkCls}>
              تنزيل
            </a>
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <div className="space-y-1">
      <a href={objectUrl} target="_blank" rel="noreferrer" className="block">
        <img
          src={objectUrl}
          alt={att.name}
          className={cn(
            "w-full cursor-zoom-in rounded-lg border object-contain",
            previewMaxHeight[variant],
            variant === "ticketsUser" ? "border-white/20" : "border-violet-200 dark:border-slate-600",
          )}
        />
      </a>
      {!compact ? (
        <div className="flex flex-wrap justify-end gap-2 text-[11px]">
          <a href={objectUrl} target="_blank" rel="noreferrer" className={linkCls}>
            فتح
          </a>
          <a href={objectUrl} download={att.name} className={linkCls}>
            تنزيل
          </a>
        </div>
      ) : null}
    </div>
  );
}

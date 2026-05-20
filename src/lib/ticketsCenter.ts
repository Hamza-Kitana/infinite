import { useEffect, useMemo, useState } from "react";
import { appendActivityLog } from "@/lib/activityLog";
import { writeSyncedLocalStorage } from "@/lib/storageSync";
import {
  migrateTicketTypeRole,
  ticketLabelForRole,
  type TicketTypeRole,
} from "@/lib/ticketTypesConfig";

export type { TicketTypeRole } from "@/lib/ticketTypesConfig";

const STORAGE_KEY = "ic_tickets_center_v1";

const EVENT_NAME = "ic-tickets-center";
const RETENTION_KEY = "ic_tickets_retention_hours_v1";
const RETENTION_EVENT_NAME = "ic-tickets-retention";

export type TicketStatus = "in_review" | "waiting" | "closed";

export type TicketMessage = {
  id: string;
  at: string;
  author: string;
  body: string;
  senderType?: "public" | "staff";
  attachments?: TicketAttachment[];
};

export type TicketAttachment = {
  id: string;
  name: string;
  mimeType: string;
  /** بيانات مضمّنة للملفات الصغيرة فقط */
  dataUrl?: string;
  /** مرجع Blob في IndexedDB للملفات الكبيرة */
  blobStoreId?: string;
};

export type TicketThread = {
  id: string;
  typeRole: TicketTypeRole;
  typeLabel: string;
  openedById?: string;
  openedBy: string;
  subject: string;
  status: TicketStatus;
  createdAt: string;
  updatedAt: string;
  messages: TicketMessage[];
  lastStaffReadAt?: string;
  lastPublicReadAt?: string;
  /** بعد إرسال رسالة «الإدمن دخل يتابع» — لا تتكرر تلقائياً */
  staffPresenceSent?: boolean;
  /** تقديم انضمام لعصابة — يُربط ببطاقة العصابة */
  gangId?: string;
  gangName?: string;
  /** طلب فتح عصابة — اسم مقترح */
  gangOpenProposedName?: string;
  gangOpenSpecialty?: string;
  gangOpenLocation?: string;
};

/** يظهر للزائر بعد إنشاء تكت جديد */
export const MSG_TICKET_CREATED_WAIT_FOR_STAFF =
  "فريق الإدارة سيستلم طلبك قريباً. خذ نفساً وانتظر قليلاً حتى يصلك رد من أحد المشرفين — يمكنك متابعة المحادثة من هنا.";

/** يظهر بعد أن يرسل الزائر رسالة إضافية على تكت مفتوح */
export const MSG_TICKET_USER_REPLY_WAIT =
  "تم إرسال رسالتك. انتظر قليلاً بينما يطلع أحد من الإدارة على المحادثة — سنرد عليك بأقرب وقت.";

const STAFF_PRESENCE_SNIPPET = "ثوانٍ أقوم بمراجعة طلبك";

/** رسالة تلقائية عندما يفتح أحد الإداريين نافذة التكت (مرة واحدة لكل تكت) */
export function buildAdminTicketPresenceBody(staffUsername: string): string {
  const name = staffUsername.trim() || "الإدارة";
  return `مرحباً، معك الإدمن ${name}. ثوانٍ أقوم بمراجعة طلبك — يمكنك إضافة أي تفاصيل هنا وسأعود إليك قريباً.`;
}

export function ticketNeedsStaffPresenceMessage(ticket: TicketThread): boolean {
  if (ticket.staffPresenceSent === true) return false;
  return !ticket.messages.some(
    (m) => (m.senderType ?? "public") === "staff" && m.body.includes(STAFF_PRESENCE_SNIPPET),
  );
}

type Persisted = { v: 1; tickets: TicketThread[] };

export type TicketRetentionHours = 24 | 72;

function isTicketStatus(v: unknown): v is TicketStatus {
  return v === "in_review" || v === "waiting" || v === "closed";
}

function normalize(raw: unknown): TicketThread[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((x): x is Partial<TicketThread> => !!x && typeof x === "object")
    .map((x) => {
      const messages = Array.isArray(x.messages)
        ? x.messages
            .filter((m): m is Partial<TicketMessage> => !!m && typeof m === "object")
            .map((m) => ({
              id: typeof m.id === "string" && m.id.trim() ? m.id : crypto.randomUUID(),
              at: typeof m.at === "string" ? m.at : new Date().toISOString(),
              author: typeof m.author === "string" ? m.author : "—",
              body: typeof m.body === "string" ? m.body : "",
              senderType: m.senderType === "staff" ? "staff" : "public",
              attachments: Array.isArray(m.attachments)
                ? m.attachments
                    .filter((a): a is Partial<TicketAttachment> => !!a && typeof a === "object")
                    .map((a) => ({
                      id: typeof a.id === "string" && a.id.trim() ? a.id : crypto.randomUUID(),
                      name: typeof a.name === "string" ? a.name : "attachment",
                      mimeType: typeof a.mimeType === "string" ? a.mimeType : "application/octet-stream",
                      dataUrl: typeof a.dataUrl === "string" && a.dataUrl ? a.dataUrl : undefined,
                      blobStoreId:
                        typeof (a as { blobStoreId?: unknown }).blobStoreId === "string" &&
                        (a as { blobStoreId: string }).blobStoreId.trim()
                          ? (a as { blobStoreId: string }).blobStoreId.trim()
                          : undefined,
                    }))
                    .filter((a) => !!(a.dataUrl?.length || a.blobStoreId?.length))
                : [],
            }))
            .filter((m) => m.body.trim().length > 0 || (m.attachments?.length ?? 0) > 0)
        : [];
      const typeRole = migrateTicketTypeRole(x.typeRole);
      return {
        id: typeof x.id === "string" && x.id.trim() ? x.id : crypto.randomUUID(),
        typeRole,
        typeLabel: ticketLabelForRole(typeRole),
        openedById: typeof x.openedById === "string" ? x.openedById : undefined,
        openedBy: typeof x.openedBy === "string" ? x.openedBy : "—",
        subject: typeof x.subject === "string" ? x.subject : "تكت بدون عنوان",
        status: isTicketStatus(x.status) ? x.status : "waiting",
        createdAt: typeof x.createdAt === "string" ? x.createdAt : new Date().toISOString(),
        updatedAt: typeof x.updatedAt === "string" ? x.updatedAt : new Date().toISOString(),
        messages,
        lastStaffReadAt: typeof x.lastStaffReadAt === "string" ? x.lastStaffReadAt : undefined,
        lastPublicReadAt: typeof x.lastPublicReadAt === "string" ? x.lastPublicReadAt : undefined,
        staffPresenceSent: x.staffPresenceSent === true,
        gangId: typeof x.gangId === "string" && x.gangId.trim() ? x.gangId.trim() : undefined,
        gangName: typeof x.gangName === "string" && x.gangName.trim() ? x.gangName.trim() : undefined,
        gangOpenProposedName:
          typeof x.gangOpenProposedName === "string" && x.gangOpenProposedName.trim()
            ? x.gangOpenProposedName.trim()
            : undefined,
        gangOpenSpecialty:
          typeof x.gangOpenSpecialty === "string" && x.gangOpenSpecialty.trim() ? x.gangOpenSpecialty.trim() : undefined,
        gangOpenLocation:
          typeof x.gangOpenLocation === "string" && x.gangOpenLocation.trim() ? x.gangOpenLocation.trim() : undefined,
      };
    });
}

function coerceRetentionHours(v: unknown): TicketRetentionHours {
  return v === 24 ? 24 : 72;
}

function retentionLabel(hours: TicketRetentionHours): string {
  return hours === 24 ? "24 ساعة" : "3 أيام";
}

export function loadTicketRetentionHours(): TicketRetentionHours {
  if (typeof window === "undefined") return 72;
  try {
    const raw = localStorage.getItem(RETENTION_KEY);
    if (!raw) return 72;
    const parsed = JSON.parse(raw) as { hours?: unknown };
    return coerceRetentionHours(parsed?.hours);
  } catch {
    return 72;
  }
}

export function saveTicketRetentionHours(hours: TicketRetentionHours) {
  if (typeof window === "undefined") return;
  writeSyncedLocalStorage(RETENTION_KEY, JSON.stringify({ hours }), [RETENTION_EVENT_NAME]);
}

/** طلبات المتجر لا تُحذف تلقائياً بمرور الوقت — فقط يدوياً من الإدارة */
function isRetentionExempt(ticket: TicketThread): boolean {
  return ticket.typeRole === "ticket_store_manager";
}

function pruneExpiredTickets(tickets: TicketThread[], hours: TicketRetentionHours) {
  const now = Date.now();
  const maxAgeMs = hours * 60 * 60 * 1000;
  const keep: TicketThread[] = [];
  const removed: TicketThread[] = [];
  for (const ticket of tickets) {
    if (isRetentionExempt(ticket)) {
      keep.push(ticket);
      continue;
    }
    const createdAtMs = new Date(ticket.createdAt).getTime();
    if (!Number.isFinite(createdAtMs) || now - createdAtMs <= maxAgeMs) {
      keep.push(ticket);
    } else {
      removed.push(ticket);
    }
  }
  return { keep, removed };
}

export function loadTickets(): TicketThread[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Persisted | TicketThread[];
    const normalized = Array.isArray(parsed)
      ? normalize(parsed)
      : parsed && parsed.v === 1 && Array.isArray(parsed.tickets)
        ? normalize(parsed.tickets)
        : [];
    const retention = loadTicketRetentionHours();
    const { keep, removed } = pruneExpiredTickets(normalized, retention);
    if (removed.length > 0) {
      const payload: Persisted = { v: 1, tickets: keep };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
      window.dispatchEvent(new CustomEvent(EVENT_NAME));
      appendActivityLog(
        "system",
        "حذف تلقائي للتكتات المنتهية",
        `تم حذف ${removed.length} تكت بسبب انتهاء المدة المحددة (${retentionLabel(retention)})`,
      );
    }
    return keep;
  } catch {
    return [];
  }
}

export function saveTickets(tickets: TicketThread[]) {
  if (typeof window === "undefined") return;
  const retention = loadTicketRetentionHours();
  const { keep, removed } = pruneExpiredTickets(tickets, retention);
  const payload: Persisted = { v: 1, tickets: keep };
  writeSyncedLocalStorage(STORAGE_KEY, JSON.stringify(payload), [EVENT_NAME]);
  if (removed.length > 0) {
    appendActivityLog(
      "system",
      "حذف تلقائي للتكتات المنتهية",
      `تم حذف ${removed.length} تكت بسبب انتهاء المدة المحددة (${retentionLabel(retention)})`,
    );
  }
}

export function createTicket(input: {
  typeRole: TicketTypeRole;
  typeLabel: string;
  openedBy: string;
  openedById?: string;
  subject?: string;
  body: string;
  attachments?: TicketAttachment[];
  gangId?: string;
  gangName?: string;
  gangOpenProposedName?: string;
  gangOpenSpecialty?: string;
  gangOpenLocation?: string;
}) {
  const now = new Date().toISOString();
  const ticket: TicketThread = {
    id: crypto.randomUUID(),
    typeRole: input.typeRole,
    typeLabel: input.typeLabel,
    openedBy: input.openedBy,
    openedById: input.openedById,
    subject: input.subject?.trim() || `${input.typeLabel} — ${input.openedBy}`,
    status: "waiting",
    createdAt: now,
    updatedAt: now,
    messages: [
      {
        id: crypto.randomUUID(),
        at: now,
        author: input.openedBy,
        body: input.body,
        senderType: "public",
        attachments: input.attachments ?? [],
      },
    ],
    staffPresenceSent: false,
    gangId: input.gangId?.trim() || undefined,
    gangName: input.gangName?.trim() || undefined,
    gangOpenProposedName: input.gangOpenProposedName?.trim() || undefined,
    gangOpenSpecialty: input.gangOpenSpecialty?.trim() || undefined,
    gangOpenLocation: input.gangOpenLocation?.trim() || undefined,
  };
  saveTickets([ticket, ...loadTickets()]);
  appendActivityLog(input.openedBy, "فتح تكت", `${ticket.typeLabel} — ${ticket.subject} — بانتظار رد الإدمن`);
  return ticket;
}

export function useTicketsCenter() {
  const [tickets, setTickets] = useState<TicketThread[]>(() => loadTickets());

  useEffect(() => {
    const sync = () => setTickets(loadTickets());
    window.addEventListener("storage", sync);
    window.addEventListener(EVENT_NAME, sync as EventListener);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener(EVENT_NAME, sync as EventListener);
    };
  }, []);

  return useMemo(() => tickets, [tickets]);
}

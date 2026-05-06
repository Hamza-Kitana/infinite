import { useEffect, useMemo, useRef, useState } from "react";
import { Navigate } from "react-router-dom";
import { BellRing, Send, TicketPlus } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { usePublicUser } from "@/contexts/PublicUserContext";
import { appendActivityLog } from "@/lib/activityLog";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import {
  createTicket,
  loadTickets,
  saveTickets,
  useTicketsCenter,
  type TicketAttachment,
  type TicketStatus,
  type TicketTypeRole,
} from "@/lib/ticketsCenter";

const TICKET_TYPES: { label: string; role: TicketTypeRole }[] = [
  { label: "دعم فني", role: "ticket_support_manager" },
  { label: "استفسار إداري", role: "ticket_admin_inquiry_manager" },
  { label: "شكوى لاعب", role: "ticket_player_complaint_manager" },
  { label: "طلب تعويض", role: "ticket_compensation_manager" },
  { label: "طلب متجر", role: "ticket_store_manager" },
  { label: "تكت عام", role: "ticket_general_manager" },
];

const STATUS_LABELS: Record<TicketStatus, string> = {
  in_review: "قيد المراجعة",
  waiting: "انتظار",
  closed: "مغلقة",
};

const STATUS_CLASSES: Record<TicketStatus, string> = {
  in_review: "border-amber-200 bg-amber-50 text-amber-700",
  waiting: "border-violet-200 bg-violet-50 text-violet-700",
  closed: "border-slate-300 bg-slate-100 text-slate-700",
};

type UserTicketNotification = {
  id: string;
  ticketId: string;
  message: string;
  createdAt: string;
  unread: boolean;
};

const TicketsPage = () => {
  const { user, getProfile } = usePublicUser();
  const tickets = useTicketsCenter();
  const profile = getProfile();
  const [typeRole, setTypeRole] = useState<TicketTypeRole | null>(null);
  const [body, setBody] = useState("");
  const [newAttachment, setNewAttachment] = useState<TicketAttachment | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [reply, setReply] = useState("");
  const [replyAttachment, setReplyAttachment] = useState<TicketAttachment | null>(null);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<UserTicketNotification[]>([]);
  const previousStaffSnapshotRef = useRef<Map<string, number>>(new Map());
  const didBootRef = useRef(false);
  const chatEndRef = useRef<HTMLDivElement | null>(null);
  const chatScrollRef = useRef<HTMLDivElement | null>(null);

  if (!user) return <Navigate to="/" replace />;

  const myTickets = useMemo(
    () =>
      tickets
        .filter((t) => t.openedById === user.id || t.openedBy === user.username || t.openedBy === user.displayName)
        .sort((a, b) => +new Date(b.updatedAt) - +new Date(a.updatedAt)),
    [tickets, user],
  );

  const selected = myTickets.find((t) => t.id === selectedTicketId) ?? null;

  const unreadTicketsCount = useMemo(() => {
    const nowOwned = new Set(myTickets.map((t) => t.id));
    let total = 0;
    for (const ticket of myTickets) {
      if (!nowOwned.has(ticket.id)) continue;
      const cutoff = ticket.lastPublicReadAt ? new Date(ticket.lastPublicReadAt).getTime() : 0;
      const hasUnread = ticket.messages.some(
        (m) => (m.senderType ?? "public") === "staff" && new Date(m.at).getTime() > cutoff,
      );
      if (hasUnread) total += 1;
    }
    return total;
  }, [myTickets]);

  useEffect(() => {
    const nextMap = new Map<string, number>(
      myTickets.map((t) => [
        t.id,
        t.messages.filter((m) => (m.senderType ?? "public") === "staff").length,
      ]),
    );
    if (!didBootRef.current) {
      previousStaffSnapshotRef.current = nextMap;
      didBootRef.current = true;
      return;
    }
    for (const ticket of myTickets) {
      const prevCount = previousStaffSnapshotRef.current.get(ticket.id) ?? 0;
      const nextCount = nextMap.get(ticket.id) ?? 0;
      if (nextCount > prevCount) {
        const message = `رد جديد من الإدارة: ${ticket.subject}`;
        setNotifications((prev) => [
          { id: crypto.randomUUID(), ticketId: ticket.id, message, createdAt: new Date().toISOString(), unread: true },
          ...prev,
        ]);
        toast.info(message);
      }
    }
    previousStaffSnapshotRef.current = nextMap;
  }, [myTickets]);

  const unreadCount = notifications.filter((n) => n.unread).length;

  const clearNotificationsForTicket = (ticketId: string) => {
    setNotifications((prev) => prev.filter((n) => n.ticketId !== ticketId));
  };

  const readAttachment = async (file: File): Promise<TicketAttachment> =>
    new Promise((resolve, reject) => {
      const r = new FileReader();
      r.onload = () =>
        resolve({
          id: crypto.randomUUID(),
          name: file.name,
          mimeType: file.type || "application/octet-stream",
          dataUrl: String(r.result),
        });
      r.onerror = () => reject(new Error("read"));
      r.readAsDataURL(file);
    });

  const notifyAttachmentStorageIssue = () => {
    toast.error("تعذر حفظ التكت مع المرفق. حجم الملف كبير على التخزين المحلي، جرّب ملفًا أصغر.");
  };

  const create = () => {
    if (!typeRole) return;
    const b = body.trim();
    if (!b) return;
    const label = TICKET_TYPES.find((x) => x.role === typeRole)?.label ?? "تكت";
    let created;
    try {
      created = createTicket({
        typeRole,
        typeLabel: label,
        openedBy: user.displayName || user.username,
        openedById: user.id,
        body: b,
        attachments: newAttachment ? [newAttachment] : [],
      });
    } catch {
      notifyAttachmentStorageIssue();
      return;
    }
    setBody("");
    setNewAttachment(null);
    setTypeRole(null);
    setIsCreateDialogOpen(false);
    setSelectedTicketId(created.id);
  };

  const sendReply = () => {
    if (!selected) return;
    const b = reply.trim();
    if (!b) return;
    const next = loadTickets().map((t) =>
      t.id !== selected.id
        ? t
        : {
            ...t,
            updatedAt: new Date().toISOString(),
            messages: [
              ...t.messages,
              {
                id: crypto.randomUUID(),
                at: new Date().toISOString(),
                author: user.displayName || user.username,
                body: b,
                senderType: "public",
                attachments: replyAttachment ? [replyAttachment] : [],
              },
            ],
          },
    );
    try {
      saveTickets(next);
    } catch {
      notifyAttachmentStorageIssue();
      return;
    }
    const hasAdminReply = selected.messages.some((m) => m.senderType === "staff");
    appendActivityLog(user.displayName || user.username, "رد المستخدم على تكت", `${selected.subject} — ${hasAdminReply ? "تم الرد سابقاً من الإدمن" : "بانتظار رد الإدمن"}`);
    setReply("");
    setReplyAttachment(null);
  };

  useEffect(() => {
    if (!selectedTicketId || !selected) return;
    const nowIso = new Date().toISOString();
    const next = loadTickets().map((t) =>
      t.id === selectedTicketId
        ? {
            ...t,
            lastPublicReadAt: nowIso,
          }
        : t,
    );
    saveTickets(next);
    const scrollToBottom = () => {
      if (chatScrollRef.current) {
        chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
      }
      chatEndRef.current?.scrollIntoView({ behavior: "auto", block: "end" });
    };
    const timer = window.setTimeout(scrollToBottom, 0);
    return () => window.clearTimeout(timer);
  }, [selectedTicketId, selected?.messages.length]);

  return (
    <div dir="rtl" className="min-h-screen bg-gradient-to-b from-[#f6f0fb] via-[#f8f4fc] to-[#fbf9fe] text-slate-900">
      <Navbar />
      <main className="mx-auto max-w-6xl space-y-6 px-4 pb-16 pt-24 md:px-8">
        <div className="rounded-2xl border border-violet-200 bg-white p-5 text-right shadow-[0_12px_32px_-24px_rgba(54,22,79,0.35)]">
          <div className="flex items-start justify-between gap-3">
            <div className="relative">
              <button
                type="button"
                className="relative inline-flex items-center gap-1 rounded-full border border-violet-300 bg-white px-3 py-1 text-xs text-violet-700 hover:bg-violet-50"
                onClick={() => setNotificationsOpen((v) => !v)}
              >
                <BellRing className="h-3.5 w-3.5" />
                الإشعارات
                {unreadCount > 0 ? (
                  <span className="absolute -left-1 -top-1 inline-flex min-w-5 items-center justify-center rounded-full bg-rose-600 px-1 text-[10px] text-white">
                    {unreadCount}
                  </span>
                ) : unreadTicketsCount > 0 ? (
                  <span className="absolute -left-1 -top-1 inline-flex min-w-5 items-center justify-center rounded-full bg-violet-600 px-1 text-[10px] text-white">
                    {unreadTicketsCount}
                  </span>
                ) : null}
              </button>
              {notificationsOpen ? (
                <div className="absolute left-0 z-20 mt-2 w-80 overflow-hidden rounded-xl border border-violet-200 bg-white shadow-xl">
                  <div className="border-b border-violet-100 px-3 py-2 text-right text-xs text-slate-600">إشعاراتك</div>
                  <div className="max-h-72 overflow-y-auto">
                    {notifications.length > 0 ? (
                      notifications.slice(0, 25).map((n) => (
                        <button
                          key={n.id}
                          type="button"
                          onClick={() => {
                            setNotificationsOpen(false);
                            setSelectedTicketId(n.ticketId);
                            clearNotificationsForTicket(n.ticketId);
                          }}
                          className={cn("w-full border-b border-violet-100 px-3 py-2 text-right hover:bg-violet-50", n.unread && "bg-violet-50/60")}
                        >
                          <p className="text-sm text-slate-800">{n.message}</p>
                          <p className="mt-1 text-[11px] text-slate-500">{new Date(n.createdAt).toLocaleString("ar")}</p>
                        </button>
                      ))
                    ) : (
                      <p className="px-3 py-4 text-right text-sm text-slate-500">لا يوجد إشعارات حالياً.</p>
                    )}
                  </div>
                </div>
              ) : null}
            </div>
            <div>
              <h1 className="font-display text-2xl font-bold text-slate-900">التكت</h1>
              <p className="mt-1 text-sm text-muted-foreground">افتح تكت جديد وتابع الردود مع الإدارة من هنا.</p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-violet-200 bg-white p-4 shadow-[0_12px_32px_-24px_rgba(54,22,79,0.35)]">
          <div className="flex items-center justify-between gap-3">
            <Button
              type="button"
              className="bg-violet-600 text-white hover:bg-violet-700"
              onClick={() => {
                setTypeRole(null);
                setBody("");
                setNewAttachment(null);
                setIsCreateDialogOpen(true);
              }}
            >
              <TicketPlus className="ms-1 h-4 w-4" />
              فتح تكت
            </Button>
            <div className="text-right">
              <h2 className="text-base font-semibold text-slate-900">فتح تكت جديد</h2>
              <p className="text-sm text-slate-600">اضغط على الزر لفتح نافذة إنشاء تكت بشكل مرتب وواضح.</p>
            </div>
          </div>
        </div>

        <div id="tickets" className="rounded-2xl border border-violet-200 bg-white p-4 shadow-[0_12px_32px_-24px_rgba(54,22,79,0.35)]">
          <h2 className="mb-3 text-right font-display text-base font-semibold text-slate-900">تكتاتي</h2>
          {myTickets.length > 0 ? (
            <div className="space-y-3">
              <div className="max-h-56 overflow-y-auto rounded-xl border border-violet-200">
                <table className="w-full text-right text-sm">
                  <thead className="bg-violet-50 text-slate-700">
                    <tr>
                      <th className="px-3 py-2">الموضوع</th>
                      <th className="px-3 py-2">الحالة</th>
                      <th className="px-3 py-2">آخر تحديث</th>
                    </tr>
                  </thead>
                  <tbody>
                    {myTickets.map((t) => (
                      <tr
                        key={t.id}
                        className="cursor-pointer border-t border-violet-100 hover:bg-violet-50"
                        onClick={() => {
                          setSelectedTicketId(t.id);
                          clearNotificationsForTicket(t.id);
                        }}
                      >
                        <td className="px-3 py-2">
                          <div className="flex items-center justify-between gap-2">
                            <span className="truncate">{t.subject}</span>
                            {(() => {
                              const cutoff = t.lastPublicReadAt ? new Date(t.lastPublicReadAt).getTime() : 0;
                              const unreadForTicket = t.messages.filter(
                                (m) => (m.senderType ?? "public") === "staff" && new Date(m.at).getTime() > cutoff,
                              ).length;
                              return unreadForTicket > 0 ? (
                                <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2 py-0.5 text-[11px] font-semibold text-rose-700">
                                  جديد
                                  <span className="rounded-full bg-rose-600 px-1 text-[10px] text-white">{unreadForTicket}</span>
                                </span>
                              ) : null;
                            })()}
                          </div>
                        </td>
                        <td className="px-3 py-2">
                          <span className={cn("rounded-full border px-2 py-0.5 text-[11px]", STATUS_CLASSES[t.status])}>{STATUS_LABELS[t.status]}</span>
                        </td>
                        <td className="px-3 py-2 text-xs text-slate-500">{new Date(t.updatedAt).toLocaleString("ar")}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <p className="rounded-xl border border-violet-200 bg-violet-50/30 p-3 text-right text-sm text-slate-600">لا يوجد تكتات بعد.</p>
          )}
        </div>
      </main>
      <Dialog
        open={isCreateDialogOpen}
        onOpenChange={(open) => {
          setIsCreateDialogOpen(open);
          if (!open) {
            setTypeRole(null);
            setBody("");
            setNewAttachment(null);
          }
        }}
      >
        <DialogContent dir="rtl" className="max-h-[90vh] max-w-2xl overflow-y-auto border-violet-200 bg-white text-slate-900">
          <DialogHeader>
            <DialogTitle className="text-right text-slate-900">فتح تكت جديد</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-2">
              <Label className="text-right text-slate-900">نوع التكت</Label>
              <div className="grid gap-2 sm:grid-cols-2">
                {TICKET_TYPES.map((item) => (
                  <button
                    key={item.role}
                    type="button"
                    onClick={() => setTypeRole(item.role)}
                    className={cn(
                      "rounded-lg border px-3 py-2 text-sm",
                      typeRole === item.role ? "border-violet-600 bg-violet-600 text-white" : "border-violet-200 bg-white text-slate-800",
                    )}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
            {typeRole ? (
              <>
                <div className="space-y-2">
                  <Label className="text-right text-slate-900">شرح المشكلة</Label>
                  <Textarea value={body} onChange={(e) => setBody(e.target.value)} className="min-h-[120px] border-violet-200 bg-white text-slate-900" />
                </div>
                <div className="space-y-2">
                  <Label className="text-right text-slate-900">إرفاق صورة/فيديو (اختياري)</Label>
                  <Input
                    type="file"
                    className="border-violet-200 bg-white text-slate-900 file:text-slate-900 file:font-medium"
                    onChange={async (e) => {
                      const f = e.target.files?.[0];
                      if (!f) return;
                      const att = await readAttachment(f);
                      setNewAttachment(att);
                    }}
                  />
                  {newAttachment ? <p className="text-xs text-slate-600">{newAttachment.name}</p> : null}
                </div>
                <div className="flex justify-end">
                  <Button type="button" className="bg-violet-600 text-white hover:bg-violet-700" onClick={create}>
                    إرسال التكت
                  </Button>
                </div>
              </>
            ) : (
              <p className="rounded-lg border border-violet-200 bg-violet-50/40 px-3 py-2 text-right text-sm text-slate-600">
                اختر نوع التكت أولًا، بعدها اكتب المشكلة وارفق ملف إذا حبيت.
              </p>
            )}
          </div>
        </DialogContent>
      </Dialog>
      <Dialog
        open={!!selectedTicketId && !!selected}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedTicketId(null);
            setReply("");
            setReplyAttachment(null);
          }
        }}
      >
        <DialogContent dir="rtl" className="max-h-[90vh] max-w-3xl overflow-hidden border-violet-200 bg-white text-slate-900">
          <DialogHeader>
            <DialogTitle className="text-right text-slate-900">
              {selected ? `محادثة التكت: ${selected.subject}` : "محادثة التكت"}
            </DialogTitle>
          </DialogHeader>
          {selected ? (
            <div className="space-y-3">
              <div ref={chatScrollRef} className="max-h-[50vh] space-y-2 overflow-y-auto rounded-xl border border-violet-200 bg-violet-50/20 p-3">
                {selected.messages.map((msg) => (
                  <div key={msg.id} className={cn("flex items-end gap-2", msg.author === user.displayName || msg.author === user.username ? "justify-end" : "justify-start")}>
                    {msg.author === user.displayName || msg.author === user.username ? (
                      <>
                        <div className="max-w-[82%] rounded-2xl rounded-br-md border border-violet-300 bg-violet-600 px-3 py-2 text-right text-white shadow-sm">
                          <p className="text-xs font-medium text-violet-100">أنت</p>
                          <p className="mt-1 whitespace-pre-wrap text-sm text-white">{msg.body}</p>
                          {msg.attachments?.length ? (
                            <div className="mt-2 space-y-2">
                              {msg.attachments.map((att) => (
                                <div key={att.id}>
                                  {att.mimeType.startsWith("video/") ? (
                                    <div className="space-y-1">
                                      <a href={att.dataUrl} target="_blank" rel="noreferrer" className="block">
                                        <video controls className="max-h-56 rounded border border-violet-200 bg-black/10">
                                          <source src={att.dataUrl} type={att.mimeType} />
                                        </video>
                                      </a>
                                      <div className="flex flex-wrap justify-end gap-2 text-[11px]">
                                        <a href={att.dataUrl} target="_blank" rel="noreferrer" className="rounded-md border border-violet-200 bg-white/10 px-2 py-1 text-violet-100 hover:bg-white/15">
                                          فتح
                                        </a>
                                        <a href={att.dataUrl} download={att.name} className="rounded-md border border-violet-200 bg-white/10 px-2 py-1 text-violet-100 hover:bg-white/15">
                                          تنزيل
                                        </a>
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="space-y-1">
                                      <a href={att.dataUrl} target="_blank" rel="noreferrer" className="block">
                                        <img src={att.dataUrl} alt={att.name} className="max-h-56 cursor-zoom-in rounded border border-violet-200" />
                                      </a>
                                      <div className="flex flex-wrap justify-end gap-2 text-[11px]">
                                        <a href={att.dataUrl} target="_blank" rel="noreferrer" className="rounded-md border border-violet-200 bg-white/10 px-2 py-1 text-violet-100 hover:bg-white/15">
                                          فتح
                                        </a>
                                        <a href={att.dataUrl} download={att.name} className="rounded-md border border-violet-200 bg-white/10 px-2 py-1 text-violet-100 hover:bg-white/15">
                                          تنزيل
                                        </a>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          ) : null}
                          <p className="mt-1 text-[11px] text-violet-100/90">{new Date(msg.at).toLocaleTimeString("ar")}</p>
                        </div>
                        <div className="h-8 w-8 shrink-0 overflow-hidden rounded-full border border-violet-300 bg-white">
                          {profile?.avatarUrl ? (
                            <img src={profile.avatarUrl} alt="User avatar" className="h-full w-full object-cover" />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center bg-violet-100 text-xs font-bold text-violet-700">
                              {user.displayName?.charAt(0) || "U"}
                            </div>
                          )}
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="h-8 w-8 shrink-0 overflow-hidden rounded-full border border-violet-300 bg-white p-1">
                          <img src="/INF_LOGO.png" alt="Infinite Admin" className="h-full w-full object-contain" />
                        </div>
                        <div className="max-w-[82%] rounded-2xl rounded-bl-md border border-violet-200 bg-white px-3 py-2 text-right text-slate-900 shadow-sm">
                          <p className="text-xs font-medium text-violet-700">إدارة Infinity</p>
                          <p className="mt-1 whitespace-pre-wrap text-sm text-slate-900">{msg.body}</p>
                          {msg.attachments?.length ? (
                            <div className="mt-2 space-y-2">
                              {msg.attachments.map((att) => (
                                <div key={att.id}>
                                  {att.mimeType.startsWith("video/") ? (
                                    <div className="space-y-1">
                                      <a href={att.dataUrl} target="_blank" rel="noreferrer" className="block">
                                        <video controls className="max-h-56 rounded border border-violet-200">
                                          <source src={att.dataUrl} type={att.mimeType} />
                                        </video>
                                      </a>
                                      <div className="flex flex-wrap justify-end gap-2 text-[11px]">
                                        <a href={att.dataUrl} target="_blank" rel="noreferrer" className="rounded-md border border-violet-200 bg-violet-50 px-2 py-1 text-violet-700 hover:bg-violet-100">
                                          فتح
                                        </a>
                                        <a href={att.dataUrl} download={att.name} className="rounded-md border border-violet-200 bg-violet-50 px-2 py-1 text-violet-700 hover:bg-violet-100">
                                          تنزيل
                                        </a>
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="space-y-1">
                                      <a href={att.dataUrl} target="_blank" rel="noreferrer" className="block">
                                        <img src={att.dataUrl} alt={att.name} className="max-h-56 cursor-zoom-in rounded border border-violet-200" />
                                      </a>
                                      <div className="flex flex-wrap justify-end gap-2 text-[11px]">
                                        <a href={att.dataUrl} target="_blank" rel="noreferrer" className="rounded-md border border-violet-200 bg-violet-50 px-2 py-1 text-violet-700 hover:bg-violet-100">
                                          فتح
                                        </a>
                                        <a href={att.dataUrl} download={att.name} className="rounded-md border border-violet-200 bg-violet-50 px-2 py-1 text-violet-700 hover:bg-violet-100">
                                          تنزيل
                                        </a>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          ) : null}
                          <p className="mt-1 text-[11px] text-slate-500">{new Date(msg.at).toLocaleTimeString("ar")}</p>
                        </div>
                      </>
                    )}
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>
              <div className="space-y-2">
                <Label className="text-right text-slate-900">إرسال رسالة جديدة</Label>
                <Textarea
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      sendReply();
                    }
                  }}
                  className="min-h-[90px] border-violet-200 bg-white text-slate-900"
                />
                <Input
                  type="file"
                  className="border-violet-200 bg-white text-slate-900 file:text-slate-900 file:font-medium"
                  onChange={async (e) => {
                    const f = e.target.files?.[0];
                    if (!f) return;
                    const att = await readAttachment(f);
                    setReplyAttachment(att);
                  }}
                />
                {replyAttachment ? <p className="text-xs text-slate-600">{replyAttachment.name}</p> : null}
                <div className="flex justify-end">
                  <Button type="button" className="bg-violet-600 text-white hover:bg-violet-700" onClick={sendReply}>
                    <Send className="ms-1 h-4 w-4" />
                    إرسال
                  </Button>
                </div>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
      <Footer forceLight />
    </div>
  );
};

export default TicketsPage;

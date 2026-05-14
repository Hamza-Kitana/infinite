import { useEffect, useMemo, useRef, useState } from "react";
import { Navigate, useSearchParams } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import {
  BellRing,
  Building2,
  Coins,
  Headphones,
  MessageSquare,
  Send,
  ShoppingBag,
  TicketPlus,
  UserRoundX,
  Clock,
  Inbox,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useApplicationsContent } from "@/contexts/ApplicationsContentContext";
import { usePublicUser } from "@/contexts/PublicUserContext";
import { appendActivityLog } from "@/lib/activityLog";
import { toast } from "sonner";
import { TicketAttachmentPicker } from "@/components/tickets/TicketAttachmentPicker";
import { TicketChatAttachmentMedia } from "@/components/tickets/TicketChatAttachmentMedia";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  createTicket,
  loadTickets,
  saveTickets,
  useTicketsCenter,
  MSG_TICKET_CREATED_WAIT_FOR_STAFF,
  MSG_TICKET_USER_REPLY_WAIT,
  type TicketAttachment,
  type TicketStatus,
  type TicketTypeRole,
} from "@/lib/ticketsCenter";
import { isPublicTicketsUnlocked, MSG_TICKETS_NEED_CITY_PROFILE } from "@/lib/publicProfileEligibility";
import { revokePendingTicketAttachment } from "@/lib/ticketAttachmentRead";

const TICKET_TYPES: { label: string; role: TicketTypeRole; icon: LucideIcon; hint: string }[] = [
  { label: "دعم فني", role: "ticket_support_manager", icon: Headphones, hint: "مشاكل تقنية أو الدخول" },
  { label: "استفسار إداري", role: "ticket_admin_inquiry_manager", icon: Building2, hint: "أسئلة للإدارة" },
  { label: "شكوى لاعب", role: "ticket_player_complaint_manager", icon: UserRoundX, hint: "بلاغ عن لاعب" },
  { label: "طلب تعويض", role: "ticket_compensation_manager", icon: Coins, hint: "تعويض عن خطأ" },
  { label: "طلب متجر", role: "ticket_store_manager", icon: ShoppingBag, hint: "مشتريات أو متجر" },
  { label: "تكت عام", role: "ticket_general_manager", icon: MessageSquare, hint: "أي موضوع آخر" },
];

const STATUS_LABELS: Record<TicketStatus, string> = {
  in_review: "قيد المراجعة",
  waiting: "انتظار",
  closed: "مغلقة",
};

const STATUS_VARIANT: Record<TicketStatus, "default" | "secondary" | "outline"> = {
  in_review: "default",
  waiting: "secondary",
  closed: "outline",
};

/** شارة «مغلقة» كانت ترث `text-foreground` فتختفي (بيضاء) على بطاقات التكتات الفاتحة */
function statusBadgeClassName(status: TicketStatus, extra?: string) {
  return cn(extra, status === "closed" && "border-slate-400 bg-slate-100 text-slate-900 hover:bg-slate-100");
}

type UserTicketNotification = {
  id: string;
  ticketId: string;
  message: string;
  createdAt: string;
  unread: boolean;
};

const TicketsPage = () => {
  const reduceMotion = useReducedMotion();
  const { user, getProfile } = usePublicUser();
  const profile = getProfile();
  const { applications } = useApplicationsContent();
  const ticketsUnlocked = useMemo(() => isPublicTicketsUnlocked(profile, applications), [profile, applications]);
  const tickets = useTicketsCenter();
  const [searchParams, setSearchParams] = useSearchParams();
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

  const myTickets = useMemo(() => {
    if (!user) return [];
    return tickets
      .filter((t) => t.openedById === user.id || t.openedBy === user.username || t.openedBy === user.displayName)
      .sort((a, b) => +new Date(b.updatedAt) - +new Date(a.updatedAt));
  }, [tickets, user]);

  const selected = myTickets.find((t) => t.id === selectedTicketId) ?? null;

  useEffect(() => {
    if (!user) return;
    const focusId = searchParams.get("focus")?.trim();
    if (!focusId) return;
    const mine = tickets.filter(
      (t) => t.openedById === user.id || t.openedBy === user.username || t.openedBy === user.displayName,
    );
    if (!mine.some((t) => t.id === focusId)) return;
    setSelectedTicketId(focusId);
    const next = new URLSearchParams(searchParams);
    next.delete("focus");
    setSearchParams(next, { replace: true });
  }, [user, tickets, searchParams, setSearchParams]);

  const unreadTicketsCount = useMemo(() => {
    let total = 0;
    for (const ticket of myTickets) {
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

  if (!user) return <Navigate to="/" replace />;
  if (!ticketsUnlocked) return <Navigate to="/profile" replace />;

  const clearNotificationsForTicket = (ticketId: string) => {
    setNotifications((prev) => prev.filter((n) => n.ticketId !== ticketId));
  };

  const notifyAttachmentStorageIssue = () => {
    toast.error("تعذر حفظ التكت. إن كان المرفق كبيرًا جرّب إغلاق بعض التبويبات أو تفريغ مساحة المتصفح.");
  };

  const create = () => {
    if (!isPublicTicketsUnlocked(profile, applications)) {
      toast.message(MSG_TICKETS_NEED_CITY_PROFILE);
      return;
    }
    if (!typeRole) return;
    const b = body.trim();
    if (!b && !newAttachment) return;
    const label = TICKET_TYPES.find((x) => x.role === typeRole)?.label ?? "تكت";
    let created;
    try {
      created = createTicket({
        typeRole,
        typeLabel: label,
        openedBy: user.displayName || user.username,
        openedById: user.id,
        body: b || (newAttachment ? "مرفق" : ""),
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
    toast.success("تم إنشاء تكتك", {
      description: MSG_TICKET_CREATED_WAIT_FOR_STAFF,
      duration: 9000,
    });
  };

  const sendReply = () => {
    if (!isPublicTicketsUnlocked(profile, applications)) {
      toast.message(MSG_TICKETS_NEED_CITY_PROFILE);
      return;
    }
    if (!selected) return;
    if (selected.status === "closed") {
      toast.message("هذا التكت مغلق. لفتح موضوع جديد استخدم «تكت جديد».");
      return;
    }
    const b = reply.trim();
    if (!b && !replyAttachment) return;
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
                body: b || (replyAttachment ? "مرفق" : ""),
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
    toast.success("تم إرسال رسالتك", {
      description: MSG_TICKET_USER_REPLY_WAIT,
      duration: 7500,
    });
  };

  const renderAttachments = (attachments: TicketAttachment[] | undefined, variant: "user" | "staff") =>
    attachments?.length ? (
      <div className="mt-2 space-y-2">
        {attachments.map((att) => (
          <TicketChatAttachmentMedia key={att.id} att={att} variant={variant === "user" ? "ticketsUser" : "ticketsStaff"} />
        ))}
      </div>
    ) : null;

  return (
    <div dir="rtl" className="min-h-screen bg-[#f4f0fb] text-slate-900 antialiased">
      <Navbar />

      <div className="relative overflow-hidden pt-[env(safe-area-inset-top,0px)]">
        <div className="pointer-events-none absolute -left-32 top-0 h-72 w-72 rounded-full bg-violet-400/20 blur-[100px]" />
        <div className="pointer-events-none absolute -right-24 top-16 h-64 w-64 rounded-full bg-fuchsia-400/15 blur-[90px]" />

        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="relative mx-auto max-w-6xl px-4 pb-6 pt-24 md:px-8"
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="text-right">
              <p className="font-display text-[11px] tracking-[0.32em] text-violet-700/90">مركز الدعم</p>
              <h1 className="mt-1 font-display text-3xl font-bold text-slate-900 md:text-4xl">التكت والمتابعة</h1>
              <p className="mt-2 max-w-xl text-sm leading-relaxed text-slate-600">
                افتح تكتًا حسب نوع الطلب، وتابع المحادثة مع الإدارة حتى يُغلق الموضوع.
              </p>
            </div>

            <div className="flex shrink-0 flex-wrap items-center gap-2">
              <div className="relative">
                <Button
                  type="button"
                  variant="outline"
                  className="relative rounded-full border-violet-300 bg-white/95 px-4 shadow-sm hover:bg-violet-50"
                  onClick={() => setNotificationsOpen((v) => !v)}
                >
                  <BellRing className="ms-2 h-4 w-4 text-violet-600" />
                  الإشعارات
                  {unreadCount > 0 ? (
                    <span className="absolute -left-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-600 px-1 text-[10px] font-bold text-white">
                      {unreadCount}
                    </span>
                  ) : unreadTicketsCount > 0 ? (
                    <span className="absolute -left-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-violet-600 px-1 text-[10px] font-bold text-white">
                      {unreadTicketsCount}
                    </span>
                  ) : null}
                </Button>
                {notificationsOpen ? (
                  <div className="absolute left-0 z-30 mt-2 w-[min(100vw-2rem,22rem)] overflow-hidden rounded-2xl border border-violet-200/90 bg-white shadow-2xl shadow-violet-900/10">
                    <div className="border-b border-violet-100 bg-gradient-to-l from-violet-50 to-white px-4 py-3 text-right">
                      <p className="text-sm font-semibold text-slate-900">آخر التنبيهات</p>
                      <p className="text-xs text-slate-500">اضغط للانتقال إلى التكت</p>
                    </div>
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
                            className={cn(
                              "w-full border-b border-violet-50 px-4 py-3 text-right transition-colors hover:bg-violet-50/80",
                              n.unread && "bg-violet-50/50",
                            )}
                          >
                            <p className="text-sm text-slate-800">{n.message}</p>
                            <p className="mt-1 text-[11px] text-slate-500">{new Date(n.createdAt).toLocaleString("ar")}</p>
                          </button>
                        ))
                      ) : (
                        <p className="px-4 py-8 text-center text-sm text-slate-500">لا توجد إشعارات بعد.</p>
                      )}
                    </div>
                  </div>
                ) : null}
              </div>

              <Button
                type="button"
                className="rounded-full bg-gradient-to-l from-violet-700 to-violet-600 px-5 text-white shadow-lg shadow-violet-500/25 hover:from-violet-800 hover:to-violet-700"
                onClick={() => {
                  setTypeRole(null);
                  setBody("");
                  setNewAttachment(null);
                  setIsCreateDialogOpen(true);
                }}
              >
                <TicketPlus className="ms-2 h-4 w-4" />
                تكت جديد
              </Button>
            </div>
          </div>

          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            {[
              { icon: Inbox, label: "إجمالي التكتات", value: String(myTickets.length), accent: "from-violet-500/15 to-violet-600/5" },
              { icon: Sparkles, label: "بانتظار قراءتك", value: String(unreadTicketsCount), accent: "from-amber-400/15 to-orange-400/5" },
              { icon: Clock, label: "آخر نشاط", value: myTickets[0] ? new Date(myTickets[0].updatedAt).toLocaleDateString("ar") : "—", accent: "from-fuchsia-400/15 to-violet-400/5" },
            ].map((stat) => (
              <Card key={stat.label} className={cn("overflow-hidden border-violet-200/80 bg-white/90 shadow-md backdrop-blur-sm")}>
                <CardContent className="flex items-center gap-4 p-4">
                  <div className={cn("flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br", stat.accent)}>
                    <stat.icon className="h-6 w-6 text-violet-700" />
                  </div>
                  <div className="min-w-0 flex-1 text-right">
                    <p className="text-xs font-medium text-slate-500">{stat.label}</p>
                    <p className="truncate font-display text-xl font-bold text-slate-900">{stat.value}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </motion.div>
      </div>

      <main className="relative z-10 mx-auto max-w-6xl space-y-8 px-4 pb-20 md:px-8">
        <motion.section
          initial={reduceMotion ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: reduceMotion ? 0 : 0.05 }}
          id="tickets"
        >
          <div className="mb-4 flex items-center justify-between gap-2">
            <h2 className="font-display text-lg font-bold text-slate-900">تكتاتي</h2>
            <span className="text-xs text-slate-500">{myTickets.length ? `${myTickets.length} تكت` : "لا يوجد بعد"}</span>
          </div>

          {myTickets.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {myTickets.map((t) => {
                const cutoff = t.lastPublicReadAt ? new Date(t.lastPublicReadAt).getTime() : 0;
                const unreadForTicket = t.messages.filter(
                  (m) => (m.senderType ?? "public") === "staff" && new Date(m.at).getTime() > cutoff,
                ).length;
                const isSelected = selectedTicketId === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => {
                      setSelectedTicketId(t.id);
                      clearNotificationsForTicket(t.id);
                    }}
                    className={cn(
                      "group rounded-2xl border bg-white p-4 text-right shadow-md transition-all hover:-translate-y-0.5 hover:shadow-lg",
                      isSelected ? "border-violet-500 ring-2 ring-violet-300/60" : "border-violet-200/90 hover:border-violet-300",
                    )}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <Badge variant={STATUS_VARIANT[t.status]} className={statusBadgeClassName(t.status, "shrink-0 rounded-full")}>
                        {STATUS_LABELS[t.status]}
                      </Badge>
                      {unreadForTicket > 0 ? (
                        <span className="rounded-full bg-rose-100 px-2 py-0.5 text-[11px] font-semibold text-rose-700">
                          جديد ({unreadForTicket})
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-3 line-clamp-2 font-display text-base font-semibold text-slate-900">{t.subject}</p>
                    <p className="mt-1 text-xs text-violet-600/90">{t.typeLabel}</p>
                    <div className="mt-3 flex items-center justify-between border-t border-violet-100 pt-3 text-[11px] text-slate-500">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        {new Date(t.updatedAt).toLocaleString("ar")}
                      </span>
                      <span className="text-violet-600 opacity-0 transition-opacity group-hover:opacity-100">فتح المحادثة ←</span>
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            <Card className="border-dashed border-violet-300 bg-violet-50/40">
              <CardContent className="flex flex-col items-center gap-4 py-14 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-violet-100">
                  <Inbox className="h-8 w-8 text-violet-500" />
                </div>
                <div>
                  <p className="font-display text-lg font-semibold text-slate-800">لا توجد تكتات بعد</p>
                  <p className="mt-1 max-w-sm text-sm text-slate-600">اضغط «تكت جديد» أعلاه لمراسلة الإدارة.</p>
                </div>
              </CardContent>
            </Card>
          )}
        </motion.section>
      </main>

      <Dialog
        open={isCreateDialogOpen}
        onOpenChange={(open) => {
          setIsCreateDialogOpen(open);
          if (!open) {
            setTypeRole(null);
            setBody("");
            setNewAttachment((prev) => {
              void revokePendingTicketAttachment(prev);
              return null;
            });
          }
        }}
      >
        <DialogContent dir="rtl" className="max-h-[90vh] max-w-2xl overflow-y-auto border-violet-200/90 bg-white text-slate-900 shadow-2xl">
          <DialogHeader className="space-y-1 text-right">
            <DialogTitle className="font-display text-xl">فتح تكت جديد</DialogTitle>
            <DialogDescription className="text-right text-slate-600">اختر النوع ثم اشرح طلبك — يمكن إرفاق صورة أو مقطع.</DialogDescription>
          </DialogHeader>
          <div className="space-y-6">
            <div>
              <Label className="mb-3 block text-right text-sm font-semibold text-slate-800">نوع الطلب</Label>
              <div className="grid gap-3 sm:grid-cols-2">
                {TICKET_TYPES.map((item) => {
                  const Icon = item.icon;
                  const active = typeRole === item.role;
                  return (
                    <button
                      key={item.role}
                      type="button"
                      onClick={() => setTypeRole(item.role)}
                      className={cn(
                        "flex flex-col items-start gap-2 rounded-2xl border p-4 text-right transition-all",
                        active
                          ? "border-violet-600 bg-gradient-to-br from-violet-600 to-violet-800 text-white shadow-lg shadow-violet-500/30"
                          : "border-violet-200 bg-white hover:border-violet-400 hover:bg-violet-50/50",
                      )}
                    >
                      <div className="flex w-full items-start justify-between gap-2">
                        <div
                          className={cn(
                            "flex h-10 w-10 items-center justify-center rounded-xl",
                            active ? "bg-white/20 text-white" : "bg-violet-100 text-violet-700",
                          )}
                        >
                          <Icon className="h-5 w-5" />
                        </div>
                      </div>
                      <span className={cn("font-display font-semibold", active ? "text-white" : "text-slate-900")}>{item.label}</span>
                      <span className={cn("text-xs leading-snug", active ? "text-violet-100" : "text-slate-500")}>{item.hint}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {typeRole ? (
              <>
                <div className="space-y-2">
                  <Label className="text-right text-slate-800">شرح الطلب</Label>
                  <Textarea
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    placeholder="اكتب التفاصيل باختصار ووضوح…"
                    className="min-h-[140px] rounded-xl border-violet-200 bg-violet-50/30 text-base leading-relaxed text-slate-900 placeholder:text-slate-400"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-right text-slate-800">مرفق (اختياري)</Label>
                  <TicketAttachmentPicker value={newAttachment} onChange={setNewAttachment} variant="public" />
                </div>
                <div className="flex justify-end pt-2">
                  <Button
                    type="button"
                    disabled={!body.trim() && !newAttachment}
                    className="rounded-xl bg-gradient-to-l from-violet-700 to-violet-600 px-8 text-white shadow-lg disabled:opacity-50"
                    onClick={create}
                  >
                    إرسال التكت
                  </Button>
                </div>
              </>
            ) : (
              <p className="rounded-xl border border-violet-200 bg-violet-50/50 px-4 py-3 text-right text-sm text-slate-600">
                اختر نوع التكت من الأعلى للمتابعة.
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
            setReplyAttachment((prev) => {
              void revokePendingTicketAttachment(prev);
              return null;
            });
          }
        }}
      >
        <DialogContent dir="rtl" className="flex max-h-[92vh] max-w-3xl flex-col gap-0 overflow-hidden border-violet-200/90 bg-white p-0 text-slate-900 shadow-2xl">
          {selected ? (
            <>
              <div className="border-b border-violet-100 bg-gradient-to-l from-violet-50 via-white to-fuchsia-50/30 px-6 py-5">
                <DialogHeader className="space-y-2 text-right">
                  <div className="flex flex-wrap items-center justify-end gap-2">
                    <Badge variant={STATUS_VARIANT[selected.status]} className={statusBadgeClassName(selected.status, "rounded-full")}>
                      {STATUS_LABELS[selected.status]}
                    </Badge>
                    <Badge variant="outline" className="rounded-full border-violet-300 text-violet-800">
                      {selected.typeLabel}
                    </Badge>
                  </div>
                  <DialogTitle className="font-display text-lg leading-snug text-slate-900">{selected.subject}</DialogTitle>
                  <DialogDescription className="text-right text-xs text-slate-500">
                    بدء المحادثة: {new Date(selected.createdAt).toLocaleString("ar")}
                  </DialogDescription>
                </DialogHeader>
              </div>

              <div ref={chatScrollRef} className="max-h-[45vh] min-h-[200px] space-y-3 overflow-y-auto bg-gradient-to-b from-slate-50/80 to-violet-50/30 px-4 py-4 md:px-6">
                {selected.messages.map((msg) => (
                  <div key={msg.id} className={cn("flex items-end gap-2", msg.author === user.displayName || msg.author === user.username ? "justify-end" : "justify-start")}>
                    {msg.author === user.displayName || msg.author === user.username ? (
                      <>
                        <div className="max-w-[88%] rounded-2xl rounded-br-md bg-gradient-to-br from-violet-600 to-violet-800 px-4 py-3 text-right text-white shadow-md">
                          <p className="text-[11px] font-medium text-violet-200">أنت</p>
                          <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed">{msg.body}</p>
                          {renderAttachments(msg.attachments, "user")}
                          <p className="mt-2 text-[10px] text-violet-200/90">{new Date(msg.at).toLocaleTimeString("ar")}</p>
                        </div>
                        <div className="h-9 w-9 shrink-0 overflow-hidden rounded-full border-2 border-white shadow-md ring-2 ring-violet-200">
                          {profile?.avatarUrl ? (
                            <img src={profile.avatarUrl} alt="" className="h-full w-full object-cover" />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center bg-violet-200 text-xs font-bold text-violet-800">
                              {user.displayName?.charAt(0) || "U"}
                            </div>
                          )}
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="h-9 w-9 shrink-0 overflow-hidden rounded-full border border-violet-200 bg-white p-1 shadow-sm">
                          <img src="/INF_LOGO.png" alt="" className="h-full w-full object-contain" />
                        </div>
                        <div className="max-w-[88%] rounded-2xl rounded-bl-md border border-violet-200 bg-white px-4 py-3 text-right shadow-md">
                          <p className="text-[11px] font-semibold text-violet-700">إدارة Infinite City</p>
                          <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed text-slate-800">{msg.body}</p>
                          {renderAttachments(msg.attachments, "staff")}
                          <p className="mt-2 text-[10px] text-slate-500">{new Date(msg.at).toLocaleTimeString("ar")}</p>
                        </div>
                      </>
                    )}
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>

              <div className="border-t border-violet-100 bg-white px-4 py-4 md:px-6">
                {selected.status === "closed" ? (
                  <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-4 text-right">
                    <p className="text-sm font-semibold text-slate-900">التكت مغلق</p>
                    <p className="mt-2 text-sm leading-relaxed text-slate-600">
                      لا يمكن إرسال ردود أو مرفقات على هذا التكت. إذا احتجت مساعدة جديدة، افتح{" "}
                      <span className="font-semibold text-violet-800">تكتًا جديدًا</span> من الزر أعلاه.
                    </p>
                    <div className="mt-4 flex flex-wrap justify-end gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        className="rounded-xl border-violet-300 bg-white text-violet-800 hover:bg-violet-50"
                        onClick={() => {
                          setReplyAttachment((prev) => {
                            void revokePendingTicketAttachment(prev);
                            return null;
                          });
                          setReply("");
                          setSelectedTicketId(null);
                        }}
                      >
                        إغلاق
                      </Button>
                      <Button
                        type="button"
                        className="rounded-xl bg-gradient-to-l from-violet-700 to-violet-600 text-white shadow-md"
                        onClick={() => {
                          setReplyAttachment((prev) => {
                            void revokePendingTicketAttachment(prev);
                            return null;
                          });
                          setReply("");
                          setSelectedTicketId(null);
                          setIsCreateDialogOpen(true);
                        }}
                      >
                        <TicketPlus className="ms-2 h-4 w-4" />
                        تكت جديد
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <Label className="mb-2 block text-right text-sm font-medium text-slate-800">رسالة جديدة</Label>
                    <Textarea
                      value={reply}
                      onChange={(e) => setReply(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          sendReply();
                        }
                      }}
                      placeholder="اكتب ردك… (Enter للإرسال، Shift+Enter سطر جديد)"
                      className="min-h-[88px] rounded-xl border-violet-200 bg-violet-50/20 text-slate-900"
                    />
                    <TicketAttachmentPicker className="mt-2" value={replyAttachment} onChange={setReplyAttachment} variant="public" />
                    <div className="mt-3 flex justify-end">
                      <Button
                        type="button"
                        disabled={!reply.trim() && !replyAttachment}
                        className="rounded-xl bg-gradient-to-l from-violet-700 to-violet-600 text-white shadow-md disabled:opacity-50"
                        onClick={sendReply}
                      >
                        <Send className="ms-2 h-4 w-4" />
                        إرسال
                      </Button>
                    </div>
                  </>
                )}
              </div>
            </>
          ) : null}
        </DialogContent>
      </Dialog>

      <Footer forceLight />
    </div>
  );
};

export default TicketsPage;

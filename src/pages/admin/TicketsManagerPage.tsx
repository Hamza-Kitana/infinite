import { useEffect, useMemo, useRef, useState } from "react";
import { BellRing, Clock3, MessageSquareMore, Send, XCircle } from "lucide-react";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAuth, type StaffRole } from "@/contexts/AuthContext";
import { appendActivityLog } from "@/lib/activityLog";
import { cn } from "@/lib/utils";
import {
  loadTicketRetentionHours,
  loadTickets,
  saveTicketRetentionHours,
  saveTickets,
  useTicketsCenter,
  type TicketRetentionHours,
  type TicketStatus,
  type TicketThread,
  type TicketTypeRole,
} from "@/lib/ticketsCenter";

const TICKET_TYPES: { slug: string; label: string; role: TicketTypeRole & StaffRole; accent: string }[] = [
  { slug: "support", label: "دعم فني", role: "ticket_support_manager", accent: "from-blue-100 to-sky-50" },
  { slug: "admin-inquiry", label: "استفسار إداري", role: "ticket_admin_inquiry_manager", accent: "from-violet-100 to-fuchsia-50" },
  { slug: "player-complaint", label: "شكوى لاعب", role: "ticket_player_complaint_manager", accent: "from-rose-100 to-pink-50" },
  { slug: "compensation", label: "طلب تعويض", role: "ticket_compensation_manager", accent: "from-amber-100 to-yellow-50" },
  { slug: "store", label: "طلب متجر", role: "ticket_store_manager", accent: "from-emerald-100 to-green-50" },
  { slug: "general", label: "تكت عام", role: "ticket_general_manager", accent: "from-slate-100 to-zinc-50" },
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

type TicketNotification = {
  id: string;
  ticketId: string;
  typeSlug: string;
  message: string;
  createdAt: string;
  unread: boolean;
};

const TicketsManagerPage = () => {
  const { ticketType } = useParams<{ ticketType?: string }>();
  const navigate = useNavigate();
  const { user, isSuperAdmin } = useAuth();
  const tickets = useTicketsCenter();
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<TicketStatus | "all">("all");
  const [chatOpen, setChatOpen] = useState(false);
  const [messageBody, setMessageBody] = useState("");
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<TicketNotification[]>([]);
  const [retentionHours, setRetentionHours] = useState<TicketRetentionHours>(() => loadTicketRetentionHours());
  const previousSnapshotRef = useRef<Map<string, number>>(new Map());
  const didBootRef = useRef(false);

  const visibleTicketTypes = isSuperAdmin
    ? TICKET_TYPES
    : TICKET_TYPES.filter((item) => (user?.roles ?? []).includes(item.role));

  const activeType = visibleTicketTypes.find((x) => x.slug === ticketType) ?? visibleTicketTypes[0] ?? null;
  const effectiveTypeRole = activeType?.role ?? null;
  const effectiveTypeLabel = activeType?.label ?? "";

  useEffect(() => {
    if (!activeType && visibleTicketTypes.length > 0) {
      navigate(`/dashboard/tickets/${visibleTicketTypes[0].slug}`, { replace: true });
    }
  }, [activeType, visibleTicketTypes, navigate]);

  const scopedTickets = useMemo(
    () => tickets.filter((t) => t.typeRole === effectiveTypeRole).sort((a, b) => +new Date(b.updatedAt) - +new Date(a.updatedAt)),
    [tickets, effectiveTypeRole],
  );

  const visibleTickets = useMemo(
    () => (statusFilter === "all" ? scopedTickets : scopedTickets.filter((t) => t.status === statusFilter)),
    [scopedTickets, statusFilter],
  );

  const selectedTicket = useMemo(
    () => scopedTickets.find((t) => t.id === selectedTicketId) ?? null,
    [scopedTickets, selectedTicketId],
  );

  useEffect(() => {
    if (visibleTicketTypes.length === 0) return;
    const allowedRoles = new Set(visibleTicketTypes.map((x) => x.role));
    const scope = tickets.filter((t) => allowedRoles.has(t.typeRole));
    // إشعارات الأدمن تعتمد فقط على رسائل المستخدم (public)
    const nextMap = new Map<string, number>(
      scope.map((t) => [t.id, t.messages.filter((m) => (m.senderType ?? "public") === "public").length]),
    );
    if (!didBootRef.current) {
      previousSnapshotRef.current = nextMap;
      didBootRef.current = true;
      return;
    }
    for (const ticket of scope) {
      const prevCount = previousSnapshotRef.current.get(ticket.id) ?? 0;
      const typeSlug = TICKET_TYPES.find((x) => x.role === ticket.typeRole)?.slug ?? "general";
      if (prevCount === 0) {
        const message = `تكت جديد: ${ticket.subject}`;
        setNotifications((prev) => [
          { id: crypto.randomUUID(), ticketId: ticket.id, typeSlug, message, createdAt: new Date().toISOString(), unread: true },
          ...prev,
        ]);
        toast.info(message);
      } else if ((nextMap.get(ticket.id) ?? 0) > prevCount) {
        const message = `رسالة جديدة في: ${ticket.subject}`;
        setNotifications((prev) => [
          { id: crypto.randomUUID(), ticketId: ticket.id, typeSlug, message, createdAt: new Date().toISOString(), unread: true },
          ...prev,
        ]);
        toast.info(message);
      }
    }
    previousSnapshotRef.current = nextMap;
  }, [tickets, visibleTicketTypes]);

  const unreadCount = notifications.filter((n) => n.unread).length;
  const unreadByTypeSlug = useMemo(() => {
    const map = new Map<string, number>();
    for (const item of notifications) {
      if (!item.unread) continue;
      map.set(item.typeSlug, (map.get(item.typeSlug) ?? 0) + 1);
    }
    return map;
  }, [notifications]);

  const openFromNotification = (notificationId: string, typeSlug: string, ticketId: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === notificationId ? { ...n, unread: false } : n)));
    setNotificationsOpen(false);
    navigate(`/dashboard/tickets/${typeSlug}`);
    setSelectedTicketId(ticketId);
    setChatOpen(true);
  };

  const clearNotificationsForTicket = (ticketId: string) => {
    setNotifications((prev) => prev.filter((n) => n.ticketId !== ticketId));
  };

  const updateTicket = (ticketId: string, updater: (current: TicketThread) => TicketThread) => {
    const next = loadTickets().map((ticket) => (ticket.id === ticketId ? updater(ticket) : ticket));
    saveTickets(next);
  };

  const handleRetentionChange = (hours: TicketRetentionHours) => {
    if (!isSuperAdmin) {
      toast.error("فقط السوبر أدمن يمكنه تغيير مدة التكتات");
      return;
    }
    setRetentionHours(hours);
    saveTicketRetentionHours(hours);
    saveTickets(loadTickets());
    appendActivityLog(
      user?.username ?? "super_admin",
      "تغيير مدة صلاحية التكتات",
      hours === 24 ? "تم ضبطها على 24 ساعة" : "تم ضبطها على 3 أيام",
    );
    toast.success(hours === 24 ? "تم ضبط مدة التكتات: 24 ساعة" : "تم ضبط مدة التكتات: 3 أيام");
  };

  const handleStatusChange = (ticketId: string, status: TicketStatus) => {
    updateTicket(ticketId, (ticket) => ({ ...ticket, status, updatedAt: new Date().toISOString() }));
    appendActivityLog(user?.username ?? "admin", "تغيير حالة تكت", `${ticketId.slice(0, 8)} -> ${STATUS_LABELS[status]}`);
  };

  const handleSendMessage = () => {
    if (!selectedTicket) return;
    const body = messageBody.trim();
    if (!body) return;
    updateTicket(selectedTicket.id, (ticket) => ({
      ...ticket,
      updatedAt: new Date().toISOString(),
      messages: [
        ...ticket.messages,
        {
          id: crypto.randomUUID(),
          at: new Date().toISOString(),
          author: user?.username ?? "staff",
          body,
          senderType: "staff",
        },
      ],
    }));
    appendActivityLog(user?.username ?? "staff", "رد الإدمن على تكت", `${selectedTicket.subject} — تم الرد من الإدمن`);
    setMessageBody("");
  };

  useEffect(() => {
    if (chatOpen && selectedTicketId) {
      clearNotificationsForTicket(selectedTicketId);
    }
  }, [chatOpen, selectedTicketId]);

  if (visibleTicketTypes.length === 0) {
    return <div className="rounded-xl border border-violet-200 bg-white/95 p-4 text-right text-sm text-slate-600">لا تملك صلاحية على أي نوع تكت حالياً.</div>;
  }
  if (!ticketType) return <Navigate to={`/dashboard/tickets/${visibleTicketTypes[0].slug}`} replace />;

  return (
    <section className="mx-auto max-w-6xl space-y-6">
      <div className={cn("rounded-2xl border border-violet-200 bg-gradient-to-b p-5 text-right shadow-[0_18px_44px_-30px_rgba(54,22,79,0.45)]", activeType?.accent ?? "from-white to-violet-50")}>
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="font-display text-2xl font-bold text-slate-900">{effectiveTypeLabel}</h1>
            <p className="mt-1 text-sm text-slate-700">جدول تكتات احترافي مع فلترة ونافذة شات للرد على الزبون.</p>
            {isSuperAdmin ? (
              <div className="mt-3 inline-flex overflow-hidden rounded-lg border border-violet-300 bg-white text-xs">
                <button
                  type="button"
                  className={cn("px-3 py-1.5", retentionHours === 24 ? "bg-[#36164f] text-white" : "text-slate-700")}
                  onClick={() => handleRetentionChange(24)}
                >
                  مدة التكت: 24 ساعة
                </button>
                <button
                  type="button"
                  className={cn("border-r border-violet-200 px-3 py-1.5", retentionHours === 72 ? "bg-[#36164f] text-white" : "text-slate-700")}
                  onClick={() => handleRetentionChange(72)}
                >
                  مدة التكت: 3 أيام
                </button>
              </div>
            ) : null}
          </div>
          <div className="relative">
            <button
              type="button"
              className="relative inline-flex items-center gap-1 rounded-full border border-violet-300 bg-white/90 px-3 py-1 text-xs text-violet-700 hover:bg-white"
              onClick={() => setNotificationsOpen((v) => !v)}
            >
              <BellRing className="h-3.5 w-3.5" />
              الإشعارات
              {unreadCount > 0 ? (
                <span className="absolute -left-1 -top-1 inline-flex min-w-5 items-center justify-center rounded-full bg-rose-600 px-1 text-[10px] text-white">
                  {unreadCount}
                </span>
              ) : null}
            </button>
            {notificationsOpen ? (
              <div className="absolute left-0 z-20 mt-2 w-80 overflow-hidden rounded-xl border border-violet-200 bg-white shadow-xl">
                <div className="border-b border-violet-100 px-3 py-2 text-right text-xs text-slate-600">
                  آخر الإشعارات
                </div>
                <div className="max-h-72 overflow-y-auto">
                  {notifications.length > 0 ? (
                    notifications.slice(0, 25).map((n) => (
                      <button
                        key={n.id}
                        type="button"
                        onClick={() => openFromNotification(n.id, n.typeSlug, n.ticketId)}
                        className={cn(
                          "w-full border-b border-violet-100 px-3 py-2 text-right hover:bg-violet-50",
                          n.unread && "bg-violet-50/60",
                        )}
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
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {visibleTicketTypes.map((item) => (
          <Button
            key={item.role}
            type="button"
            asChild
            variant="outline"
            className={cn(
              "h-12 justify-center rounded-xl border-violet-300 bg-white text-sm text-violet-800 hover:bg-violet-50 hover:text-violet-900",
              effectiveTypeRole === item.role && "border-[#36164f] bg-[#36164f] text-white hover:bg-[#2f1344] hover:text-white",
            )}
          >
            <Link to={`/dashboard/tickets/${item.slug}`} className="relative inline-flex w-full items-center justify-center">
              <MessageSquareMore className="ms-2 h-4 w-4" />
              {item.label}
              {(unreadByTypeSlug.get(item.slug) ?? 0) > 0 ? (
                <span className="absolute -left-2 -top-2 inline-flex min-w-5 items-center justify-center rounded-full bg-rose-600 px-1 text-[10px] text-white">
                  {unreadByTypeSlug.get(item.slug)}
                </span>
              ) : null}
            </Link>
          </Button>
        ))}
      </div>

      <div className="rounded-2xl border border-violet-200 bg-white/95 p-4 shadow-[0_16px_36px_-24px_rgba(54,22,79,0.35)]">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <p className="font-display text-sm text-slate-700">{effectiveTypeLabel} — عدد التكتات: {visibleTickets.length}</p>
          <div className="inline-flex overflow-hidden rounded-lg border border-violet-200 bg-white text-xs">
            <button type="button" className={cn("px-2.5 py-1.5", statusFilter === "all" ? "bg-[#36164f] text-white" : "text-slate-700")} onClick={() => setStatusFilter("all")}>الكل</button>
            <button type="button" className={cn("border-r border-violet-200 px-2.5 py-1.5", statusFilter === "in_review" ? "bg-amber-100 text-amber-800" : "text-slate-700")} onClick={() => setStatusFilter("in_review")}>قيد المراجعة</button>
            <button type="button" className={cn("border-r border-violet-200 px-2.5 py-1.5", statusFilter === "waiting" ? "bg-violet-100 text-violet-800" : "text-slate-700")} onClick={() => setStatusFilter("waiting")}>انتظار</button>
            <button type="button" className={cn("border-r border-violet-200 px-2.5 py-1.5", statusFilter === "closed" ? "bg-slate-200 text-slate-800" : "text-slate-700")} onClick={() => setStatusFilter("closed")}>مغلقة</button>
          </div>
        </div>

        {visibleTickets.length > 0 ? (
          <div className="overflow-hidden rounded-xl border border-violet-200">
            <table className="w-full text-right text-sm">
              <thead className="bg-violet-50/70 text-slate-700">
                <tr>
                  <th className="px-3 py-2 font-medium">الموضوع</th>
                  <th className="px-3 py-2 font-medium">الزبون</th>
                  <th className="px-3 py-2 font-medium">الحالة</th>
                  <th className="px-3 py-2 font-medium">آخر تحديث</th>
                </tr>
              </thead>
              <tbody>
                {visibleTickets.map((ticket) => (
                  <tr
                    key={ticket.id}
                    className="cursor-pointer border-t border-violet-100 bg-white hover:bg-violet-50/45"
                    onClick={() => {
                      setSelectedTicketId(ticket.id);
                      setChatOpen(true);
                      clearNotificationsForTicket(ticket.id);
                    }}
                  >
                    <td className="px-3 py-2 font-display text-slate-900">{ticket.subject}</td>
                    <td className="px-3 py-2 text-slate-700">{ticket.openedBy}</td>
                    <td className="px-3 py-2">
                      <span className={cn("rounded-full border px-2 py-0.5 text-[11px]", STATUS_CLASSES[ticket.status])}>{STATUS_LABELS[ticket.status]}</span>
                    </td>
                    <td className="px-3 py-2 text-xs text-slate-500">{new Date(ticket.updatedAt).toLocaleString("ar")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="rounded-xl border border-violet-200 bg-violet-50/40 p-3 text-right text-sm text-slate-600">لا توجد تكتات في هذا الفلتر حالياً.</p>
        )}
      </div>

      <Dialog open={chatOpen && !!selectedTicket} onOpenChange={setChatOpen}>
        <DialogContent dir="rtl" className="border-violet-300 bg-[#f7f1fc] text-right sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle className="font-display text-slate-900">{selectedTicket?.subject ?? "تفاصيل التكت"}</DialogTitle>
          </DialogHeader>

          {selectedTicket ? (
            <div className="space-y-4">
              <div className="rounded-xl border border-violet-200 bg-white/90 p-3">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm text-slate-700">الزبون: <span className="font-medium text-slate-900">{selectedTicket.openedBy}</span></p>
                  <span className={cn("rounded-full border px-2 py-0.5 text-[11px]", STATUS_CLASSES[selectedTicket.status])}>{STATUS_LABELS[selectedTicket.status]}</span>
                </div>
                <div className="mt-3 flex flex-wrap justify-end gap-2">
                  <Button type="button" variant="outline" className="border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100" onClick={() => handleStatusChange(selectedTicket.id, "in_review")}><Clock3 className="ms-1 h-4 w-4" />قيد المراجعة</Button>
                  <Button type="button" variant="outline" className="border-violet-200 bg-violet-50 text-violet-700 hover:bg-violet-100" onClick={() => handleStatusChange(selectedTicket.id, "waiting")}>انتظار</Button>
                  <Button type="button" variant="outline" className="border-slate-300 bg-slate-100 text-slate-700 hover:bg-slate-200" onClick={() => handleStatusChange(selectedTicket.id, "closed")}><XCircle className="ms-1 h-4 w-4" />مغلقة</Button>
                </div>
              </div>

              <div className="max-h-[45vh] space-y-2 overflow-y-auto rounded-xl border border-violet-200 bg-violet-50/20 p-3">
                {selectedTicket.messages.map((msg) => {
                  const mine = msg.author === (user?.username ?? "");
                  return (
                    <div key={msg.id} className={cn("flex", mine ? "justify-start" : "justify-end")}>
                      <div className={cn("max-w-[85%] rounded-xl border px-3 py-2 text-right", mine ? "border-violet-300 bg-violet-100/70 text-slate-900" : "border-violet-200 bg-white text-slate-900")}>
                        <p className="text-xs font-medium text-violet-800">{msg.author}</p>
                        <p className="mt-1 whitespace-pre-wrap text-sm">{msg.body}</p>
                        {msg.attachments?.length ? (
                          <div className="mt-2 space-y-2">
                            {msg.attachments.map((att) => (
                              <div key={att.id}>
                                {att.mimeType.startsWith("video/") ? (
                                  <video controls className="max-h-56 rounded border border-violet-200">
                                    <source src={att.dataUrl} type={att.mimeType} />
                                  </video>
                                ) : (
                                  <img src={att.dataUrl} alt={att.name} className="max-h-56 rounded border border-violet-200" />
                                )}
                              </div>
                            ))}
                          </div>
                        ) : null}
                        <p className="mt-1 text-[11px] text-slate-500">{new Date(msg.at).toLocaleString("ar")}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="space-y-2">
                <Label className="text-right text-slate-700">رد الإداري</Label>
                <Textarea value={messageBody} onChange={(e) => setMessageBody(e.target.value)} className="min-h-[80px] border-violet-200 bg-white text-slate-900 placeholder:text-slate-400" placeholder="اكتب ردك للزبون..." />
              </div>
            </div>
          ) : null}

          <DialogFooter className="gap-2 sm:justify-start">
            <Button type="button" variant="outline" className="border-violet-200 bg-white text-violet-700 hover:bg-violet-50" onClick={() => setChatOpen(false)}>إغلاق</Button>
            <Button type="button" className="bg-[#36164f] text-white hover:bg-[#2f1344]" onClick={handleSendMessage}>
              <Send className="ms-1 h-4 w-4" />
              إرسال الرد
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
};

export default TicketsManagerPage;

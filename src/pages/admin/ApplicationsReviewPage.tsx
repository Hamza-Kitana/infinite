import { useMemo, useState } from "react";
import { CheckCircle2, ClipboardList, XCircle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAuth } from "@/contexts/AuthContext";
import { useApplicationsContent } from "@/contexts/ApplicationsContentContext";
import type { ApplicationRecord, ApplicationStatus } from "@/data/publicApplicationTypes";
import { getArabCountryLabel, isArabCountryCode } from "@/data/arabCountries";
import { appendActivityLog } from "@/lib/activityLog";
import { cn } from "@/lib/utils";

function genderAr(g: "male" | "female") {
  return g === "male" ? "ذكر" : "أنثى";
}

function statusBadge(status: ApplicationStatus) {
  if (status === "pending")
    return "bg-amber-500/15 text-amber-700 border border-amber-500/30";
  if (status === "approved")
    return "bg-emerald-500/15 text-emerald-700 border border-emerald-500/30";
  return "bg-destructive/15 text-destructive border border-destructive/30";
}

function statusLabel(status: ApplicationStatus) {
  if (status === "pending") return "قيد المراجعة";
  if (status === "approved") return "مقبول";
  return "مرفوض";
}

const ApplicationsReviewPage = () => {
  const { user, isSuperAdmin } = useAuth();
  const { applications, setDecision } = useApplicationsContent();
  const [filter, setFilter] = useState<ApplicationStatus | "all">("pending");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [decisionNote, setDecisionNote] = useState("");
  const [search, setSearch] = useState("");

  const sorted = useMemo(
    () => [...applications].sort((a, b) => b.submittedAt.localeCompare(a.submittedAt)),
    [applications],
  );

  const filtered = useMemo(() => {
    const byStatus = filter === "all" ? sorted : sorted.filter((a) => a.status === filter);
    const q = search.trim().toLowerCase();
    if (!q) return byStatus;
    return byStatus.filter((a) =>
      `${a.targetTitle} ${a.roleKey} ${a.snapshot.firstName} ${a.snapshot.lastName} ${a.snapshot.discord}`
        .toLowerCase()
        .includes(q),
    );
  }, [sorted, filter, search]);

  const selected = useMemo(() => {
    if (!selectedId) return null;
    return sorted.find((a) => a.id === selectedId) ?? null;
  }, [sorted, selectedId]);

  const runDecision = (status: "approved" | "rejected") => {
    if (!selected || selected.status !== "pending") return;
    const name = user?.username?.trim() || (isSuperAdmin ? "super_admin" : "reviewer");
    setDecision(selected.id, status, name, decisionNote);
    appendActivityLog(
      name,
      status === "approved" ? "قرار تقديم: قبول" : "قرار تقديم: رفض",
      `طلب ${selected.targetTitle} (${selected.id.slice(0, 8)})`,
    );
    setDecisionNote("");
    toast.success(status === "approved" ? "تم تسجيل القبول" : "تم تسجيل الرفض");
  };

  return (
    <div className="mx-auto max-w-6xl space-y-8 pb-12 text-right">
      <div>
        <h1 className="font-display text-2xl font-bold flex items-center justify-end gap-2 text-slate-900">
          <ClipboardList className="h-7 w-7 text-violet-700" />
          طلبات التقديم من الموقع
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-slate-600">
          كل من لديه دور «مراجع التقديمات» يرى نفس القائمة. السوبر أدمِن يراها أيضاً دون الحاجة لهذا الدور.
        </p>
      </div>

      <Tabs
        value={filter}
        onValueChange={(v) => {
          setFilter(v as ApplicationStatus | "all");
          setSelectedId(null);
        }}
        dir="rtl"
        className="w-full"
      >
        <TabsList className="flex w-full flex-wrap justify-end gap-1 h-auto rounded-xl border border-violet-200 bg-white p-1">
          <TabsTrigger value="pending">قيد المراجعة</TabsTrigger>
          <TabsTrigger value="all">الكل</TabsTrigger>
          <TabsTrigger value="approved">مقبول</TabsTrigger>
          <TabsTrigger value="rejected">مرفوض</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="mt-6">
          <div className="mb-3 max-w-sm">
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="ابحث بالاسم أو نوع الطلب أو الديسكورد..."
              className="border-violet-200 bg-white text-slate-900 placeholder:text-slate-400"
              autoComplete="off"
            />
          </div>
          <div className="space-y-2 rounded-xl border border-violet-200 bg-white/95 p-2 max-h-[70vh] overflow-y-auto shadow-[0_14px_34px_-24px_rgba(54,22,79,0.4)]">
            {filtered.length === 0 ? (
              <p className="p-4 text-center text-sm text-slate-500">لا توجد طلبات.</p>
            ) : (
              filtered.map((a) => (
                <button
                  key={a.id}
                  type="button"
                  onClick={() => setSelectedId(a.id)}
                  className="w-full rounded-lg border border-violet-100 px-3 py-2 text-right transition-colors hover:bg-violet-50/70"
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className={cn("shrink-0 rounded px-1.5 py-0.5 text-[10px] font-display", statusBadge(a.status))}>
                      {statusLabel(a.status)}
                    </span>
                    <p className="truncate text-xs text-slate-500 font-mono" dir="ltr">
                      {new Date(a.submittedAt).toLocaleString("ar")}
                    </p>
                    <p className="truncate text-sm text-slate-700">
                      {a.snapshot.firstName} {a.snapshot.lastName}
                    </p>
                    <p className="truncate font-display text-sm font-semibold text-slate-900">{a.targetTitle}</p>
                  </div>
                </button>
              ))
            )}
          </div>
      </div>

      <Dialog open={!!selected} onOpenChange={(open) => !open && setSelectedId(null)}>
        <DialogContent
          dir="rtl"
          className="w-[calc(100%-1rem)] max-w-4xl border-violet-300 bg-[#f7f1fc] text-slate-900"
        >
          <DialogHeader className="text-right">
            <DialogTitle className="text-slate-900">تفاصيل الطلب</DialogTitle>
          </DialogHeader>
          {selected ? (
            <ApplicationDetail
              app={selected}
              decisionNote={decisionNote}
              setDecisionNote={setDecisionNote}
              onApprove={() => runDecision("approved")}
              onReject={() => runDecision("rejected")}
            />
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
};

function ApplicationDetail({
  app,
  decisionNote,
  setDecisionNote,
  onApprove,
  onReject,
}: {
  app: ApplicationRecord;
  decisionNote: string;
  setDecisionNote: (v: string) => void;
  onApprove: () => void;
  onReject: () => void;
}) {
  const s = app.snapshot;
  const countryLabel = isArabCountryCode(s.countryCode) ? getArabCountryLabel(s.countryCode) : s.countryCode;

  return (
    <div className="min-w-0 space-y-4 rounded-2xl border border-violet-200 bg-gradient-to-b from-white to-violet-50/35 p-4 shadow-[0_24px_52px_-30px_rgba(54,22,79,0.5)] sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-2 border-b border-violet-200/80 pb-3">
        <div>
          <h2 className="font-display text-lg font-bold text-slate-900">{app.targetTitle}</h2>
          <p className="text-xs text-slate-500 font-mono" dir="ltr">
            {app.roleKey} · {app.id.slice(0, 8)}…
          </p>
        </div>
        <span className={cn("rounded-md px-2 py-1 text-xs font-display", statusBadge(app.status))}>
          {statusLabel(app.status)}
        </span>
      </div>

      <dl className="grid gap-3 sm:grid-cols-2 text-sm">
        <DetailRow label="الاسم" value={`${s.firstName} ${s.lastName}`} />
        <DetailRow label="الجنس" value={genderAr(s.gender)} />
        <DetailRow label="تاريخ الميلاد" value={s.birthSummaryLine} />
        <DetailRow label="العمر" value={s.ageSummaryLine} />
        <DetailRow label="الدولة" value={countryLabel} />
        <DetailRow label="الديسكورد" value={s.discord} dir="ltr" />
        <DetailRow label="مدن/سيرفرات سابقة" value={s.previousCities} className="sm:col-span-2" />
        <DetailRow label="الخبرة والدوافع" value={s.experience} className="sm:col-span-2" />
        <DetailRow label="الإقرار بالقوانين" value={s.lawsAccepted ? "نعم" : "لا"} />
      </dl>

      {app.status !== "pending" && (
        <div className="rounded-lg border border-violet-200 bg-violet-50/35 p-3 text-sm text-slate-700">
          <p>
            <span className="text-slate-500">القرار بواسطة:</span> {app.decidedBy ?? "—"}
          </p>
          <p className="mt-1 font-mono text-xs text-slate-500" dir="ltr">
            {app.decidedAt ? new Date(app.decidedAt).toLocaleString("ar") : ""}
          </p>
          {app.note ? (
            <p className="mt-2 text-slate-600">
              <span className="text-slate-900 font-medium">ملاحظة:</span> {app.note}
            </p>
          ) : null}
        </div>
      )}

      {app.status === "pending" ? (
        <div className="space-y-3 border-t border-violet-200/80 pt-4">
          <div>
            <Label className="text-xs font-medium text-slate-700">ملاحظة للقرار (اختياري)</Label>
            <Textarea
              className="mt-1 min-h-[72px] border-violet-200 bg-white text-slate-900 placeholder:text-slate-400 focus-visible:ring-violet-400"
              value={decisionNote}
              onChange={(e) => setDecisionNote(e.target.value)}
              placeholder="تظهر مع الطلب بعد القبول أو الرفض…"
            />
          </div>
          <div className="flex flex-wrap gap-2 justify-end">
            <Button
              type="button"
              className="bg-[#36164f] text-white hover:bg-[#2f1344]"
              onClick={onApprove}
            >
              <CheckCircle2 className="ms-2 h-4 w-4" /> قبول
            </Button>
            <Button
              type="button"
              variant="outline"
              className="border-rose-300 bg-rose-50 text-rose-700 hover:bg-rose-100 hover:text-rose-800"
              onClick={onReject}
            >
              <XCircle className="ms-2 h-4 w-4" /> رفض
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function DetailRow({
  label,
  value,
  dir,
  className,
}: {
  label: string;
  value: string;
  dir?: "ltr";
  className?: string;
}) {
  return (
    <div className={cn("rounded-lg border border-violet-200 bg-violet-50/30 px-3 py-2", className)}>
      <dt className="font-display text-[10px] text-violet-700">{label}</dt>
      <dd className={cn("mt-1 text-slate-900 whitespace-pre-wrap break-words", dir === "ltr" && "font-mono text-left")} dir={dir}>
        {value || "—"}
      </dd>
    </div>
  );
}

export default ApplicationsReviewPage;

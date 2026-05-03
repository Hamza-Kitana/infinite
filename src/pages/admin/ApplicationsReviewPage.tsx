import { useMemo, useState } from "react";
import { CheckCircle2, ClipboardList, XCircle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
    return "bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30";
  if (status === "approved")
    return "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30";
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

  const sorted = useMemo(
    () => [...applications].sort((a, b) => b.submittedAt.localeCompare(a.submittedAt)),
    [applications],
  );

  const filtered = useMemo(() => {
    if (filter === "all") return sorted;
    return sorted.filter((a) => a.status === filter);
  }, [sorted, filter]);

  const selected = useMemo(() => {
    if (filtered.length === 0) return null;
    if (selectedId) {
      const hit = filtered.find((a) => a.id === selectedId);
      if (hit) return hit;
    }
    return filtered[0];
  }, [filtered, selectedId]);

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
        <h1 className="font-display text-2xl font-bold flex items-center justify-end gap-2">
          <ClipboardList className="h-7 w-7 text-primary" />
          طلبات التقديم من الموقع
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
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
        <TabsList className="flex w-full flex-wrap justify-end gap-1 h-auto p-1">
          <TabsTrigger value="pending">قيد المراجعة</TabsTrigger>
          <TabsTrigger value="all">الكل</TabsTrigger>
          <TabsTrigger value="approved">مقبول</TabsTrigger>
          <TabsTrigger value="rejected">مرفوض</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="mt-6">
          <div className="grid gap-6 lg:grid-cols-[minmax(0,280px)_1fr]">
            <div className="space-y-2 rounded-xl border border-primary/15 bg-card/40 p-2 max-h-[70vh] overflow-y-auto">
              {filtered.length === 0 ? (
                <p className="p-4 text-center text-sm text-muted-foreground">لا توجد طلبات.</p>
              ) : (
                filtered.map((a) => (
                  <button
                    key={a.id}
                    type="button"
                    onClick={() => setSelectedId(a.id)}
                    className={cn(
                      "w-full rounded-lg border px-3 py-2.5 text-right transition-colors",
                      selected?.id === a.id
                        ? "border-primary/50 bg-primary/10"
                        : "border-transparent hover:bg-primary/5",
                    )}
                  >
                    <p className="font-display text-sm font-semibold truncate">{a.targetTitle}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {a.snapshot.firstName} {a.snapshot.lastName}
                    </p>
                    <p className="mt-1 font-mono text-[10px] text-muted-foreground" dir="ltr">
                      {new Date(a.submittedAt).toLocaleString("ar")}
                    </p>
                    <span
                      className={cn("mt-1 inline-block rounded px-1.5 py-0.5 text-[10px] font-display", statusBadge(a.status))}
                    >
                      {statusLabel(a.status)}
                    </span>
                  </button>
                ))
              )}
            </div>

            {selected ? (
              <ApplicationDetail
                app={selected}
                decisionNote={decisionNote}
                setDecisionNote={setDecisionNote}
                onApprove={() => runDecision("approved")}
                onReject={() => runDecision("rejected")}
              />
            ) : (
              <p className="text-muted-foreground text-sm p-6">اختر طلباً من القائمة.</p>
            )}
          </div>
      </div>
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
    <div className="min-w-0 space-y-4 rounded-2xl border border-primary/20 bg-card/50 p-4 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-2 border-b border-primary/15 pb-3">
        <div>
          <h2 className="font-display text-lg font-bold">{app.targetTitle}</h2>
          <p className="text-xs text-muted-foreground font-mono" dir="ltr">
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
        <div className="rounded-lg border border-primary/15 bg-background/50 p-3 text-sm">
          <p>
            <span className="text-muted-foreground">القرار بواسطة:</span> {app.decidedBy ?? "—"}
          </p>
          <p className="mt-1 font-mono text-xs text-muted-foreground" dir="ltr">
            {app.decidedAt ? new Date(app.decidedAt).toLocaleString("ar") : ""}
          </p>
          {app.note ? (
            <p className="mt-2 text-muted-foreground">
              <span className="text-foreground font-medium">ملاحظة:</span> {app.note}
            </p>
          ) : null}
        </div>
      )}

      {app.status === "pending" ? (
        <div className="space-y-3 border-t border-primary/15 pt-4">
          <div>
            <Label className="text-xs">ملاحظة للقرار (اختياري)</Label>
            <Textarea
              className="mt-1 min-h-[72px]"
              value={decisionNote}
              onChange={(e) => setDecisionNote(e.target.value)}
              placeholder="تظهر مع الطلب بعد القبول أو الرفض…"
            />
          </div>
          <div className="flex flex-wrap gap-2 justify-end">
            <Button type="button" variant="outline" className="border-emerald-500/40 text-emerald-700 hover:bg-emerald-500/10" onClick={onApprove}>
              <CheckCircle2 className="ms-2 h-4 w-4" /> قبول
            </Button>
            <Button type="button" variant="destructive" onClick={onReject}>
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
    <div className={cn("rounded-lg border border-primary/10 bg-background/40 px-3 py-2", className)}>
      <dt className="font-display text-[10px] text-primary">{label}</dt>
      <dd className={cn("mt-1 text-foreground/95 whitespace-pre-wrap break-words", dir === "ltr" && "font-mono text-left")} dir={dir}>
        {value || "—"}
      </dd>
    </div>
  );
}

export default ApplicationsReviewPage;

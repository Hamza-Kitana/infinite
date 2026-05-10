import { useCallback, useEffect, useMemo, useState } from "react";
import { Navigate } from "react-router-dom";
import {
  CalendarRange,
  ChevronDown,
  Clock4,
  Download,
  FileSearch,
  Filter,
  History,
  ListFilter,
  RotateCcw,
  Search,
  Ticket,
  Users,
  X,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import type { ActivityLogEntry } from "@/lib/activityLog";
import { loadActivityLog } from "@/lib/activityLog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  adminInput,
  adminPageDesc,
  adminPageWrap,
  adminStatCard,
  adminTitleIcon,
} from "@/lib/adminUi";
import { cn } from "@/lib/utils";

type RangePreset = "1h" | "6h" | "24h" | "today" | "7d" | "30d" | "custom" | "all";

const RANGE_OPTIONS: { value: RangePreset; label: string }[] = [
  { value: "1h", label: "آخر ساعة" },
  { value: "6h", label: "آخر 6 ساعات" },
  { value: "24h", label: "آخر 24 ساعة" },
  { value: "today", label: "اليوم" },
  { value: "7d", label: "آخر 7 أيام" },
  { value: "30d", label: "آخر 30 يوم" },
  { value: "custom", label: "نطاق مخصص" },
  { value: "all", label: "الكل" },
];

function formatLogDateTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "وقت غير صالح";
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = String(d.getFullYear());
  const hours = String(d.getHours()).padStart(2, "0");
  const minutes = String(d.getMinutes()).padStart(2, "0");
  const seconds = String(d.getSeconds()).padStart(2, "0");
  return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
}

function relativeFromNow(iso: string): string {
  const t = new Date(iso).getTime();
  if (!Number.isFinite(t)) return "";
  const diff = Date.now() - t;
  if (diff < 0) return "بعد لحظات";
  const sec = Math.floor(diff / 1000);
  if (sec < 60) return `قبل ${sec} ثانية`;
  const min = Math.floor(sec / 60);
  if (min < 60) return `قبل ${min} دقيقة`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `قبل ${hr} ساعة`;
  const day = Math.floor(hr / 24);
  if (day < 30) return `قبل ${day} يوم`;
  const mo = Math.floor(day / 30);
  if (mo < 12) return `قبل ${mo} شهر`;
  return `قبل ${Math.floor(mo / 12)} سنة`;
}

/** يعطي الحدود الزمنية (from/to) من preset */
function rangeBoundsFromPreset(preset: RangePreset): { from: number | null; to: number | null } {
  const now = Date.now();
  const HOUR = 60 * 60 * 1000;
  const DAY = 24 * HOUR;
  switch (preset) {
    case "1h":
      return { from: now - HOUR, to: null };
    case "6h":
      return { from: now - 6 * HOUR, to: null };
    case "24h":
      return { from: now - DAY, to: null };
    case "today": {
      const start = new Date();
      start.setHours(0, 0, 0, 0);
      return { from: start.getTime(), to: null };
    }
    case "7d":
      return { from: now - 7 * DAY, to: null };
    case "30d":
      return { from: now - 30 * DAY, to: null };
    case "all":
    case "custom":
    default:
      return { from: null, to: null };
  }
}

/** datetime-local value (yyyy-MM-ddTHH:mm) → ms */
function dtLocalToMs(s: string): number | null {
  if (!s) return null;
  const t = new Date(s).getTime();
  return Number.isFinite(t) ? t : null;
}

function exportToCsv(rows: ActivityLogEntry[]): string {
  const header = ["#", "Time (ISO)", "Time (Local)", "Actor", "Action", "Detail"];
  const lines = [header.join(",")];
  rows.forEach((e, idx) => {
    const cells = [
      String(idx + 1),
      e.at,
      formatLogDateTime(e.at),
      e.actor,
      e.action,
      (e.detail ?? "").replace(/[\r\n]+/g, " "),
    ].map((c) => `"${String(c).replace(/"/g, '""')}"`);
    lines.push(cells.join(","));
  });
  return lines.join("\n");
}

const TICKET_KEYWORDS = ["تكت", "تذكر"]; /** كلمات تُحدد لوجات التكتات */

const ActivityLogPage = () => {
  const { isSuperAdmin } = useAuth();
  const [entries, setEntries] = useState<ActivityLogEntry[]>(() => loadActivityLog());
  const [searchQuery, setSearchQuery] = useState("");
  const [rangePreset, setRangePreset] = useState<RangePreset>("all");
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");
  const [selectedActors, setSelectedActors] = useState<Set<string>>(new Set());
  const [selectedActions, setSelectedActions] = useState<Set<string>>(new Set());
  const [ticketFilter, setTicketFilter] = useState("");
  const [onlyTicketLogs, setOnlyTicketLogs] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(true);

  const refresh = useCallback(() => setEntries(loadActivityLog()), []);

  useEffect(() => {
    const on = () => refresh();
    window.addEventListener("ic-activity-log", on as EventListener);
    const onStorage = (e: StorageEvent) => {
      if (e.key === "ic_activity_log_v1") refresh();
    };
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener("ic-activity-log", on as EventListener);
      window.removeEventListener("storage", onStorage);
    };
  }, [refresh]);

  /** قوائم الحسابات والأفعال الفريدة (ديناميكية) */
  const uniqueActors = useMemo(() => {
    const set = new Set<string>();
    for (const e of entries) {
      const a = e.actor?.trim();
      if (a) set.add(a);
    }
    return [...set].sort((a, b) => a.localeCompare(b, "ar"));
  }, [entries]);

  const uniqueActions = useMemo(() => {
    const set = new Set<string>();
    for (const e of entries) {
      const a = e.action?.trim();
      if (a) set.add(a);
    }
    return [...set].sort((a, b) => a.localeCompare(b, "ar"));
  }, [entries]);

  /** الحدود الزمنية المحسوبة */
  const { fromMs, toMs } = useMemo(() => {
    if (rangePreset === "custom") {
      return { fromMs: dtLocalToMs(customFrom), toMs: dtLocalToMs(customTo) };
    }
    const r = rangeBoundsFromPreset(rangePreset);
    return { fromMs: r.from, toMs: r.to };
  }, [rangePreset, customFrom, customTo]);

  /** فلترة شاملة */
  const filteredEntries = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const tq = ticketFilter.trim().toLowerCase();
    return entries.filter((entry) => {
      const t = new Date(entry.at).getTime();
      if (!Number.isFinite(t)) return false;
      if (fromMs != null && t < fromMs) return false;
      if (toMs != null && t > toMs) return false;

      if (selectedActors.size > 0 && !selectedActors.has(entry.actor)) return false;
      if (selectedActions.size > 0 && !selectedActions.has(entry.action)) return false;

      const actionLower = entry.action.toLowerCase();
      const detailLower = (entry.detail ?? "").toLowerCase();

      if (onlyTicketLogs) {
        const isTicket = TICKET_KEYWORDS.some(
          (k) => actionLower.includes(k) || detailLower.includes(k),
        );
        if (!isTicket) return false;
      }

      if (tq) {
        const inDetail = detailLower.includes(tq);
        const inAction = actionLower.includes(tq);
        if (!inDetail && !inAction) return false;
      }

      if (q) {
        const haystack = `${entry.actor} ${entry.action} ${entry.detail ?? ""}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }

      return true;
    });
  }, [
    entries,
    searchQuery,
    ticketFilter,
    onlyTicketLogs,
    fromMs,
    toMs,
    selectedActors,
    selectedActions,
  ]);

  const totalEntries = entries.length;
  const displayedEntries = filteredEntries.length;

  const activeFiltersCount =
    (searchQuery.trim() ? 1 : 0) +
    (rangePreset !== "all" ? 1 : 0) +
    (selectedActors.size > 0 ? 1 : 0) +
    (selectedActions.size > 0 ? 1 : 0) +
    (ticketFilter.trim() ? 1 : 0) +
    (onlyTicketLogs ? 1 : 0);

  const resetAllFilters = () => {
    setSearchQuery("");
    setRangePreset("all");
    setCustomFrom("");
    setCustomTo("");
    setSelectedActors(new Set());
    setSelectedActions(new Set());
    setTicketFilter("");
    setOnlyTicketLogs(false);
  };

  const toggleSet = (set: Set<string>, val: string): Set<string> => {
    const next = new Set(set);
    if (next.has(val)) next.delete(val);
    else next.add(val);
    return next;
  };

  const handleExportCsv = () => {
    const csv = exportToCsv(filteredEntries);
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const stamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
    a.href = url;
    a.download = `activity-log-${stamp}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const rangeLabelText = useMemo(() => {
    const opt = RANGE_OPTIONS.find((o) => o.value === rangePreset);
    if (!opt) return "الكل";
    if (rangePreset === "custom") {
      const fr = customFrom ? formatLogDateTime(new Date(customFrom).toISOString()) : "—";
      const to = customTo ? formatLogDateTime(new Date(customTo).toISOString()) : "—";
      return `مخصص: من ${fr} إلى ${to}`;
    }
    return opt.label;
  }, [rangePreset, customFrom, customTo]);

  if (!isSuperAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className={cn(adminPageWrap, "max-w-7xl space-y-6")}>
      <div className="text-right">
        <h1 className="flex items-center justify-end gap-2 font-display text-2xl font-bold tracking-tight text-slate-900">
          <History className={adminTitleIcon} />
          سجل النشاط
        </h1>
        <p className={adminPageDesc}>
          فلترة شاملة باللوجات: حسب الوقت، الحساب، نوع الفعل، أو رقم تكت معيّن — مخزّن محلياً في
          هذا المتصفح.
        </p>
      </div>

      {/* بطاقات إحصائية */}
      <div className="grid gap-4 sm:grid-cols-4">
        <div className={adminStatCard}>
          <p className="text-xs font-medium text-slate-500">إجمالي اللوجات</p>
          <p className="mt-1 font-display text-2xl font-bold text-violet-700">{totalEntries}</p>
        </div>
        <div className={adminStatCard}>
          <p className="text-xs font-medium text-slate-500">المعروض</p>
          <p className="mt-1 font-display text-2xl font-bold text-emerald-700">
            {displayedEntries}
          </p>
          <p className="mt-0.5 text-[10px] text-slate-500">
            بعد تطبيق {activeFiltersCount} فلتر
          </p>
        </div>
        <div className={adminStatCard}>
          <p className="text-xs font-medium text-slate-500">النطاق الزمني</p>
          <p className="mt-1 truncate font-display text-sm font-semibold text-slate-800">
            {rangeLabelText}
          </p>
        </div>
        <div className={adminStatCard}>
          <p className="text-xs font-medium text-slate-500">آخر حدث</p>
          <p className="mt-1 truncate font-display text-sm font-semibold text-slate-800">
            {entries[0] ? relativeFromNow(entries[0].at) : "لا يوجد"}
          </p>
          <p className="mt-0.5 truncate font-mono text-[10px] text-slate-500" dir="ltr">
            {entries[0] ? formatLogDateTime(entries[0].at) : "—"}
          </p>
        </div>
      </div>

      {/* شريط الفلاتر */}
      <div className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-[0_2px_14px_-4px_rgba(15,23,42,0.08)]">
        <button
          type="button"
          className="flex w-full items-center justify-between gap-2 border-b border-slate-200 bg-gradient-to-l from-violet-50/60 to-white px-4 py-3 text-right hover:bg-violet-50/40"
          onClick={() => setFiltersOpen((v) => !v)}
          aria-expanded={filtersOpen}
        >
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8 gap-1 border-violet-200 bg-white text-violet-700 hover:bg-violet-50"
              onClick={(ev) => {
                ev.stopPropagation();
                handleExportCsv();
              }}
              disabled={filteredEntries.length === 0}
            >
              <Download className="h-3.5 w-3.5" />
              تصدير CSV
            </Button>
            {activeFiltersCount > 0 ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-8 gap-1 border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100"
                onClick={(ev) => {
                  ev.stopPropagation();
                  resetAllFilters();
                }}
              >
                <RotateCcw className="h-3.5 w-3.5" />
                إعادة تعيين
              </Button>
            ) : null}
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-violet-700" />
            <span className="font-display text-sm font-semibold text-slate-900">الفلاتر</span>
            {activeFiltersCount > 0 ? (
              <Badge className="h-5 rounded-full bg-violet-600 px-2 text-[10px] text-white">
                {activeFiltersCount} نشط
              </Badge>
            ) : null}
            <ChevronDown
              className={cn(
                "h-4 w-4 text-slate-500 transition-transform",
                filtersOpen && "rotate-180",
              )}
            />
          </div>
        </button>

        {filtersOpen ? (
          <div className="space-y-5 p-4 sm:p-5">
            {/* الصف 1: البحث + التكت */}
            <div className="grid gap-3 lg:grid-cols-2">
              <div className="space-y-1.5">
                <Label className="flex items-center justify-end gap-1.5 text-xs text-slate-700">
                  <Search className="h-3.5 w-3.5 text-violet-600" /> بحث نصي شامل
                </Label>
                <div className="relative">
                  <Search className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-violet-500" />
                  <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="الحساب، الفعل، أو التفاصيل..."
                    className={cn(adminInput, "pr-9")}
                    autoComplete="off"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="flex items-center justify-end gap-1.5 text-xs text-slate-700">
                  <Ticket className="h-3.5 w-3.5 text-violet-600" /> بحث في تفاصيل التكت (ID
                  / موضوع / كلمة)
                </Label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <FileSearch className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-violet-500" />
                    <Input
                      value={ticketFilter}
                      onChange={(e) => setTicketFilter(e.target.value)}
                      placeholder="مثال: 4f2a3b1c أو 'شكوى'..."
                      className={cn(adminInput, "pr-9")}
                      autoComplete="off"
                    />
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className={cn(
                      "shrink-0 border-violet-200",
                      onlyTicketLogs
                        ? "bg-violet-100 text-violet-800"
                        : "bg-white text-slate-700 hover:bg-violet-50",
                    )}
                    onClick={() => setOnlyTicketLogs((v) => !v)}
                  >
                    لوجات التكتات فقط
                  </Button>
                </div>
                <p className="text-[11px] text-slate-500">
                  مثال — لوجات الردود على تكت: ابحث بـ"رد" أو ضع جزء من ID التكت.
                </p>
              </div>
            </div>

            {/* الصف 2: النطاق الزمني */}
            <div className="space-y-2">
              <Label className="flex items-center justify-end gap-1.5 text-xs text-slate-700">
                <CalendarRange className="h-3.5 w-3.5 text-violet-600" /> النطاق الزمني
              </Label>
              <div className="flex flex-wrap items-center justify-end gap-1.5">
                {RANGE_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setRangePreset(opt.value)}
                    className={cn(
                      "rounded-full border px-3 py-1.5 font-display text-xs transition",
                      rangePreset === opt.value
                        ? "border-violet-500 bg-violet-100 text-violet-800 shadow-sm"
                        : "border-slate-200 bg-white text-slate-600 hover:border-violet-300 hover:bg-violet-50",
                    )}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
              {rangePreset === "custom" ? (
                <div className="grid gap-3 rounded-xl border border-violet-200 bg-violet-50/40 p-3 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label className="flex items-center justify-end gap-1 text-xs text-slate-700">
                      <Clock4 className="h-3.5 w-3.5 text-violet-600" /> من تاريخ/ساعة
                    </Label>
                    <Input
                      type="datetime-local"
                      value={customFrom}
                      onChange={(e) => setCustomFrom(e.target.value)}
                      className={cn(adminInput, "font-mono")}
                      dir="ltr"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="flex items-center justify-end gap-1 text-xs text-slate-700">
                      <Clock4 className="h-3.5 w-3.5 text-violet-600" /> إلى تاريخ/ساعة
                    </Label>
                    <Input
                      type="datetime-local"
                      value={customTo}
                      onChange={(e) => setCustomTo(e.target.value)}
                      className={cn(adminInput, "font-mono")}
                      dir="ltr"
                    />
                  </div>
                </div>
              ) : null}
            </div>

            {/* الصف 3: متعدد الاختيار للحساب والفعل */}
            <div className="grid gap-3 lg:grid-cols-2">
              <MultiSelectFacet
                icon={<Users className="h-3.5 w-3.5 text-violet-600" />}
                label="الحساب (Actor)"
                placeholder="اختر مستخدم/أدمن لتصفية لوجاته"
                options={uniqueActors}
                selected={selectedActors}
                onToggle={(val) => setSelectedActors((s) => toggleSet(s, val))}
                onClear={() => setSelectedActors(new Set())}
                emptyHint="لا توجد حسابات بعد"
              />
              <MultiSelectFacet
                icon={<ListFilter className="h-3.5 w-3.5 text-violet-600" />}
                label="نوع الفعل (Action)"
                placeholder="اختر أفعال محددة (تسجيل دخول، رد على تكت...)"
                options={uniqueActions}
                selected={selectedActions}
                onToggle={(val) => setSelectedActions((s) => toggleSet(s, val))}
                onClear={() => setSelectedActions(new Set())}
                emptyHint="لا توجد أفعال بعد"
              />
            </div>

            {/* شارات الفلاتر النشطة */}
            {activeFiltersCount > 0 ? (
              <div className="flex flex-wrap items-center justify-end gap-1.5 border-t border-slate-200 pt-3">
                <span className="font-display text-[11px] text-slate-500">فلاتر نشطة:</span>
                {searchQuery.trim() ? (
                  <FilterChip onRemove={() => setSearchQuery("")}>
                    بحث: «{searchQuery.trim()}»
                  </FilterChip>
                ) : null}
                {rangePreset !== "all" ? (
                  <FilterChip onRemove={() => setRangePreset("all")}>
                    وقت: {rangeLabelText}
                  </FilterChip>
                ) : null}
                {selectedActors.size > 0
                  ? [...selectedActors].map((a) => (
                      <FilterChip
                        key={`actor-${a}`}
                        tone="violet"
                        onRemove={() =>
                          setSelectedActors((s) => {
                            const n = new Set(s);
                            n.delete(a);
                            return n;
                          })
                        }
                      >
                        @{a}
                      </FilterChip>
                    ))
                  : null}
                {selectedActions.size > 0
                  ? [...selectedActions].map((a) => (
                      <FilterChip
                        key={`action-${a}`}
                        tone="indigo"
                        onRemove={() =>
                          setSelectedActions((s) => {
                            const n = new Set(s);
                            n.delete(a);
                            return n;
                          })
                        }
                      >
                        {a}
                      </FilterChip>
                    ))
                  : null}
                {ticketFilter.trim() ? (
                  <FilterChip tone="amber" onRemove={() => setTicketFilter("")}>
                    تكت: «{ticketFilter.trim()}»
                  </FilterChip>
                ) : null}
                {onlyTicketLogs ? (
                  <FilterChip tone="amber" onRemove={() => setOnlyTicketLogs(false)}>
                    لوجات التكتات فقط
                  </FilterChip>
                ) : null}
              </div>
            ) : null}
          </div>
        ) : null}
      </div>

      {/* الجدول */}
      <div className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-[0_4px_24px_-8px_rgba(15,23,42,0.12)]">
        <div className="overflow-x-auto">
          <div className="min-w-[920px]">
            <div className="grid grid-cols-[minmax(170px,1fr)_minmax(150px,1fr)_minmax(180px,1.2fr)_minmax(0,2fr)] gap-px bg-slate-200/80">
              <div className="bg-slate-50 px-3 py-2.5 text-xs font-display font-semibold text-slate-700">
                الوقت
              </div>
              <div className="bg-slate-50 px-3 py-2.5 text-xs font-display font-semibold text-slate-700">
                المستخدم
              </div>
              <div className="bg-slate-50 px-3 py-2.5 text-xs font-display font-semibold text-slate-700">
                الفعل
              </div>
              <div className="bg-slate-50 px-3 py-2.5 text-xs font-display font-semibold text-slate-700">
                التفاصيل
              </div>
            </div>
            <ul className="divide-y divide-slate-100">
              {filteredEntries.length === 0 ? (
                <li className="px-4 py-12 text-center text-sm text-slate-500">
                  {activeFiltersCount > 0
                    ? "لا توجد لوجات تطابق الفلاتر الحالية. حاول تخفيف الشروط."
                    : "لا توجد أحداث مسجّلة بعد."}
                </li>
              ) : (
                filteredEntries.map((e) => (
                  <li
                    key={e.id}
                    className="grid grid-cols-1 gap-2 px-4 py-3 text-sm odd:bg-white even:bg-slate-50/70 sm:grid-cols-[minmax(170px,1fr)_minmax(150px,1fr)_minmax(180px,1.2fr)_minmax(0,2fr)] sm:items-start sm:gap-4"
                  >
                    <div className="flex flex-col gap-0.5">
                      <span className="whitespace-nowrap font-mono text-xs text-slate-700" dir="ltr">
                        {formatLogDateTime(e.at)}
                      </span>
                      <span className="text-[10px] text-slate-400">{relativeFromNow(e.at)}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedActors((s) => {
                          if (s.has(e.actor)) return s;
                          const n = new Set(s);
                          n.add(e.actor);
                          return n;
                        });
                      }}
                      className="text-right font-medium text-slate-900 hover:text-violet-700 hover:underline"
                      title="فلترة لوجات هذا المستخدم"
                    >
                      {e.actor}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedActions((s) => {
                          if (s.has(e.action)) return s;
                          const n = new Set(s);
                          n.add(e.action);
                          return n;
                        });
                      }}
                      className="text-right font-display text-sm font-medium text-violet-700 hover:underline"
                      title="فلترة لوجات هذا الفعل"
                    >
                      {e.action}
                    </button>
                    <p className="min-w-0 break-words text-xs leading-relaxed text-slate-600">
                      {e.detail ?? "—"}
                    </p>
                  </li>
                ))
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActivityLogPage;

/* ----------------------------------------------------------- */
/* مكوّنات داخلية */

function FilterChip({
  children,
  onRemove,
  tone = "slate",
}: {
  children: React.ReactNode;
  onRemove: () => void;
  tone?: "slate" | "violet" | "indigo" | "amber";
}) {
  const toneClass =
    tone === "violet"
      ? "border-violet-200 bg-violet-50 text-violet-800"
      : tone === "indigo"
        ? "border-indigo-200 bg-indigo-50 text-indigo-800"
        : tone === "amber"
          ? "border-amber-200 bg-amber-50 text-amber-800"
          : "border-slate-200 bg-slate-50 text-slate-700";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px]",
        toneClass,
      )}
    >
      {children}
      <button
        type="button"
        onClick={onRemove}
        className="rounded-full p-0.5 hover:bg-black/5"
        aria-label="إزالة الفلتر"
      >
        <X className="h-3 w-3" />
      </button>
    </span>
  );
}

function MultiSelectFacet({
  icon,
  label,
  placeholder,
  options,
  selected,
  onToggle,
  onClear,
  emptyHint,
}: {
  icon: React.ReactNode;
  label: string;
  placeholder: string;
  options: string[];
  selected: Set<string>;
  onToggle: (val: string) => void;
  onClear: () => void;
  emptyHint: string;
}) {
  const [search, setSearch] = useState("");
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return options;
    return options.filter((o) => o.toLowerCase().includes(q));
  }, [options, search]);

  const triggerLabel =
    selected.size === 0
      ? placeholder
      : selected.size === 1
        ? [...selected][0]
        : `${selected.size} خيارات مختارة`;

  return (
    <div className="space-y-1.5">
      <Label className="flex items-center justify-end gap-1.5 text-xs text-slate-700">
        {icon} {label}
      </Label>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            className={cn(
              "h-10 w-full justify-between rounded-md border-slate-200 bg-white px-3 text-right text-sm font-normal text-slate-700 hover:bg-violet-50/50",
              selected.size > 0 && "border-violet-300 bg-violet-50 text-violet-900",
            )}
          >
            <ChevronDown className="h-4 w-4 text-slate-500" />
            <span className="truncate">{triggerLabel}</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent
          align="end"
          dir="rtl"
          className="w-[min(420px,90vw)] border-violet-200 bg-white p-0 text-slate-900 shadow-xl"
        >
          <div className="border-b border-slate-200 p-2">
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="ابحث..."
              className={cn(adminInput, "h-9")}
              autoFocus
            />
          </div>
          {options.length === 0 ? (
            <p className="px-4 py-6 text-center text-xs text-slate-500">{emptyHint}</p>
          ) : (
            <ScrollArea className="max-h-[260px]">
              <ul className="space-y-0.5 p-1">
                {filtered.map((opt) => {
                  const checked = selected.has(opt);
                  return (
                    <li key={opt}>
                      <button
                        type="button"
                        onClick={() => onToggle(opt)}
                        className={cn(
                          "flex w-full items-center justify-between gap-2 rounded-lg px-2.5 py-2 text-right text-sm transition",
                          checked
                            ? "bg-violet-50 text-violet-900"
                            : "text-slate-700 hover:bg-slate-50",
                        )}
                      >
                        <Checkbox
                          checked={checked}
                          onCheckedChange={() => onToggle(opt)}
                          onClick={(ev) => ev.stopPropagation()}
                          className="border-slate-300 data-[state=checked]:bg-violet-600 data-[state=checked]:text-white"
                        />
                        <span className="min-w-0 flex-1 truncate text-right">{opt}</span>
                      </button>
                    </li>
                  );
                })}
                {filtered.length === 0 ? (
                  <li className="px-3 py-4 text-center text-xs text-slate-500">
                    لا توجد نتائج مطابقة.
                  </li>
                ) : null}
              </ul>
            </ScrollArea>
          )}
          <div className="flex items-center justify-between border-t border-slate-200 p-2">
            <span className="text-[11px] text-slate-500">
              {selected.size} / {options.length}
            </span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-7 border-rose-200 bg-rose-50 px-2 text-[11px] text-rose-700 hover:bg-rose-100"
              onClick={onClear}
              disabled={selected.size === 0}
            >
              مسح
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}

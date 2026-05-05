import { useCallback, useEffect, useMemo, useState } from "react";
import { Navigate } from "react-router-dom";
import { History, Search } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import type { ActivityLogEntry } from "@/lib/activityLog";
import { loadActivityLog } from "@/lib/activityLog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function formatLogDateTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "وقت غير صالح";
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = String(d.getFullYear());
  const hours = String(d.getHours()).padStart(2, "0");
  const minutes = String(d.getMinutes()).padStart(2, "0");
  return `${day}/${month}/${year} ${hours}:${minutes}`;
}

const ActivityLogPage = () => {
  const { isSuperAdmin } = useAuth();
  const [entries, setEntries] = useState<ActivityLogEntry[]>(() => loadActivityLog());
  const [searchQuery, setSearchQuery] = useState("");

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

  const filteredEntries = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return entries;
    return entries.filter((entry) => {
      const haystack = `${entry.actor} ${entry.action} ${entry.detail ?? ""}`.toLowerCase();
      return haystack.includes(q);
    });
  }, [entries, searchQuery]);

  const totalEntries = entries.length;
  const displayedEntries = filteredEntries.length;

  if (!isSuperAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6 pb-12 text-right">
      <div className="text-right">
        <div>
          <h1 className="flex items-center justify-end gap-2 font-display text-2xl font-bold text-slate-900">
            <History className="h-7 w-7 text-violet-700" />
            سجل النشاط
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            من قام بماذا ومتى — محلي في هذا المتصفح (للعرض التجريبي).
          </p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl bg-white/90 p-4 shadow-[0_14px_30px_-22px_rgba(54,22,79,0.4)]">
          <p className="text-xs text-slate-500">إجمالي اللوجات</p>
          <p className="mt-1 font-display text-2xl font-bold text-violet-700">{totalEntries}</p>
        </div>
        <div className="rounded-xl bg-white/90 p-4 shadow-[0_14px_30px_-22px_rgba(54,22,79,0.4)]">
          <p className="text-xs text-slate-500">المعروض حالياً</p>
          <p className="mt-1 font-display text-2xl font-bold text-violet-700">{displayedEntries}</p>
        </div>
        <div className="rounded-xl bg-white/90 p-4 shadow-[0_14px_30px_-22px_rgba(54,22,79,0.4)]">
          <Label htmlFor="log-search" className="text-xs text-slate-500">
            البحث في اللوجات
          </Label>
          <div className="relative mt-1.5">
            <Search className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-violet-500" />
            <Input
              id="log-search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث باسم المستخدم أو الفعل أو التفاصيل..."
              className="border-violet-200 bg-violet-50/35 pr-9 text-slate-900 placeholder:text-slate-400 focus-visible:ring-violet-400"
              autoComplete="off"
            />
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-violet-200/80 bg-white/95 shadow-[0_18px_44px_-28px_rgba(54,22,79,0.45)]">
        <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)_minmax(0,1.2fr)_minmax(0,2fr)] gap-px bg-violet-200/70">
          <div className="bg-violet-50 px-3 py-2.5 text-xs font-display font-semibold text-violet-700">الوقت</div>
          <div className="bg-violet-50 px-3 py-2.5 text-xs font-display font-semibold text-violet-700">المستخدم</div>
          <div className="bg-violet-50 px-3 py-2.5 text-xs font-display font-semibold text-violet-700">الفعل</div>
          <div className="bg-violet-50 px-3 py-2.5 text-xs font-display font-semibold text-violet-700">التفاصيل</div>
        </div>
        <ul className="min-w-[920px] divide-y divide-violet-100">
          {filteredEntries.length === 0 ? (
            <li className="px-4 py-12 text-center text-sm text-slate-500">
              {searchQuery.trim() ? "لا توجد نتائج مطابقة للبحث." : "لا توجد أحداث مسجّلة بعد."}
            </li>
          ) : (
            filteredEntries.map((e) => (
              <li
                key={e.id}
                className="grid grid-cols-1 gap-2 px-4 py-3 text-sm odd:bg-white even:bg-violet-50/35 sm:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)_minmax(0,1.2fr)_minmax(0,2fr)] sm:items-start sm:gap-4"
              >
                <span className="whitespace-nowrap font-mono text-xs text-slate-500" dir="ltr">
                  {formatLogDateTime(e.at)}
                </span>
                <span className="font-medium text-slate-900">{e.actor}</span>
                <span className="font-display text-sm text-violet-800">{e.action}</span>
                <p className="min-w-0 break-words text-xs leading-relaxed text-slate-600">{e.detail ?? "—"}</p>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
};

export default ActivityLogPage;

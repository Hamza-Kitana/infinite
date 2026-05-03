import { useCallback, useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { History } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import type { ActivityLogEntry } from "@/lib/activityLog";
import { loadActivityLog } from "@/lib/activityLog";
import { Button } from "@/components/ui/button";

const ActivityLogPage = () => {
  const { isSuperAdmin } = useAuth();
  const [entries, setEntries] = useState<ActivityLogEntry[]>(() => loadActivityLog());

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

  if (!isSuperAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="mx-auto max-w-5xl space-y-8 pb-12 text-right">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold flex items-center justify-end gap-2 text-slate-800 dark:text-slate-100">
            <History className="h-7 w-7 text-sky-600 dark:text-sky-400" />
            سجل النشاط
          </h1>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            من قام بماذا ومتى — محلي في هذا المتصفح (للعرض التجريبي).
          </p>
        </div>
        <Button type="button" variant="outline" className="shrink-0 border-slate-200 dark:border-slate-700" onClick={refresh}>
          تحديث القائمة
        </Button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm dark:border-slate-700/80 dark:bg-slate-900/60">
        <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)_minmax(0,2fr)] gap-px bg-slate-200 dark:bg-slate-700">
          <div className="bg-slate-50 px-3 py-2.5 text-xs font-display font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
            الوقت
          </div>
          <div className="bg-slate-50 px-3 py-2.5 text-xs font-display font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
            المستخدم
          </div>
          <div className="bg-slate-50 px-3 py-2.5 text-xs font-display font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
            الفعل / التفاصيل
          </div>
        </div>
        <ul className="divide-y divide-slate-100 dark:divide-slate-800">
          {entries.length === 0 ? (
            <li className="px-4 py-12 text-center text-sm text-slate-500">لا توجد أحداث مسجّلة بعد.</li>
          ) : (
            entries.map((e) => (
              <li key={e.id} className="grid grid-cols-1 gap-2 px-4 py-3 text-sm sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,2fr)] sm:items-start sm:gap-4">
                <span className="font-mono text-xs text-slate-500 whitespace-nowrap" dir="ltr">
                  {new Date(e.at).toLocaleString("ar")}
                </span>
                <span className="font-medium text-slate-800 dark:text-slate-100">{e.actor}</span>
                <div className="min-w-0 space-y-1">
                  <p className="font-display text-sm text-sky-700 dark:text-sky-300">{e.action}</p>
                  {e.detail ? (
                    <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-400 break-words">{e.detail}</p>
                  ) : null}
                </div>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
};

export default ActivityLogPage;

import { NavLink, Outlet, useLocation } from "react-router-dom";
import { ClipboardList, Video } from "lucide-react";
import { useApplicationsContent } from "@/contexts/ApplicationsContentContext";
import { countPendingStreamerApplications } from "@/lib/streamerApplication";
import { cn } from "@/lib/utils";

const StreamersAdminShell = () => {
  const { applications } = useApplicationsContent();
  const location = useLocation();
  const pendingCount = countPendingStreamerApplications(applications);
  const onApplications = location.pathname.includes("/applications");

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-violet-200/80 pb-4 dark:border-violet-800/60">
        <div className="text-right">
          <p className="font-display text-[11px] tracking-[0.28em] text-violet-600 dark:text-violet-400">
            STREAMER MANAGER
          </p>
          <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-slate-50">ستريمر منجر</h1>
        </div>
        <nav className="flex flex-wrap gap-2">
          <NavLink
            to="/dashboard/streamers"
            end
            className={({ isActive }) =>
              cn(
                "inline-flex items-center gap-2 rounded-xl px-4 py-2.5 font-display text-sm transition",
                isActive && !onApplications
                  ? "bg-violet-600 text-white shadow-sm"
                  : "border border-violet-200 bg-white text-violet-800 hover:bg-violet-50 dark:border-violet-700 dark:bg-slate-900 dark:text-violet-200",
              )
            }
          >
            <Video className="h-4 w-4" />
            بطاقات صنّاع المحتوى
          </NavLink>
          <NavLink
            to="/dashboard/streamers/applications"
            className={({ isActive }) =>
              cn(
                "inline-flex items-center gap-2 rounded-xl px-4 py-2.5 font-display text-sm transition",
                isActive
                  ? "bg-violet-600 text-white shadow-sm"
                  : "border border-violet-200 bg-white text-violet-800 hover:bg-violet-50 dark:border-violet-700 dark:bg-slate-900 dark:text-violet-200",
              )
            }
          >
            <ClipboardList className="h-4 w-4" />
            طلبات الستريمر
            {pendingCount > 0 ? (
              <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-amber-500 px-1.5 text-[10px] font-bold text-white">
                {pendingCount}
              </span>
            ) : null}
          </NavLink>
        </nav>
      </div>
      <Outlet />
    </div>
  );
};

export default StreamersAdminShell;

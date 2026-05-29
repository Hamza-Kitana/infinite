import type { ReactNode } from "react";
import { useLocation } from "react-router-dom";
import { Construction } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useSiteMaintenance } from "@/lib/siteMaintenance";

type Props = {
  children: ReactNode;
};

/**
 * يعرض شاشة الصيانة على الموقع العام عند التفعيل.
 * لوحة التحكم والمالك المخفي يتجاوزان القفل.
 */
export function SiteMaintenanceGate({ children }: Props) {
  const { pathname } = useLocation();
  const { isOwner } = useAuth();
  const maintenance = useSiteMaintenance();

  if (pathname.startsWith("/dashboard") || isOwner) {
    return <>{children}</>;
  }

  if (!maintenance.active) {
    return <>{children}</>;
  }

  return (
    <div
      dir="rtl"
      className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-slate-950 via-[hsl(265_32%_12%)] to-slate-950 px-6 py-16 text-center text-white"
    >
      <div className="mx-auto flex max-w-lg flex-col items-center gap-6 rounded-3xl border border-violet-500/25 bg-slate-900/80 px-8 py-12 shadow-[0_24px_80px_-24px_rgba(0,0,0,0.75)] backdrop-blur-sm">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500/15 text-amber-400 ring-1 ring-amber-500/30">
          <Construction className="h-8 w-8" aria-hidden />
        </div>
        <div className="space-y-2">
          <p className="font-display text-[11px] font-semibold tracking-[0.32em] text-violet-300">INFINITE CITY</p>
          <h1 className="font-display text-2xl font-bold text-white md:text-3xl">الموقع تحت الصيانة</h1>
          <p className="text-sm leading-relaxed text-slate-300">
            نعمل حالياً على تحديثات وصيانة. يرجى المحاولة لاحقاً — شكراً لتفهمكم.
          </p>
        </div>
      </div>
    </div>
  );
}

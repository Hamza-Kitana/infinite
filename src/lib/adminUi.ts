import { cn } from "@/lib/utils";

/** أسطح وحدود موحّدة للوحة التحكم (خلفية فاتحة متناسقة مع الهيكل) */
export const adminPageWrap = "mx-auto w-full max-w-[1400px] space-y-8 pb-12 text-right";

export const adminPageTitle =
  "flex items-center justify-end gap-2 font-display text-2xl font-bold tracking-tight text-slate-900";

export const adminPageDesc = "mt-2 max-w-2xl text-sm leading-relaxed text-slate-600";

/** بطاقة محتوى رئيسية */
export const adminCard =
  "rounded-2xl border border-slate-200/90 bg-white shadow-[0_2px_14px_-4px_rgba(15,23,42,0.08)]";

export const adminCardPad = "p-5 sm:p-6";

/** بطاقة ثانوية / KPI */
export const adminStatCard =
  "rounded-2xl border border-slate-200/85 bg-white p-4 shadow-[0_2px_12px_-4px_rgba(15,23,42,0.06)] sm:p-5";

/** حاوية جداول أو قوائم طويلة */
export const adminListShell =
  "rounded-2xl border border-slate-200/90 bg-white p-2 shadow-sm max-h-[70vh] overflow-y-auto";

export const adminRow =
  "w-full rounded-xl border border-transparent px-3 py-2.5 text-right transition-colors hover:border-slate-200 hover:bg-slate-50";

/** حقول داخل اللوحة */
export const adminInput =
  "border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus-visible:border-violet-400 focus-visible:ring-violet-500/25";

/** شريط تبويب */
export const adminTabsList =
  "flex h-auto w-full flex-wrap justify-end gap-1 rounded-xl border border-slate-200 bg-slate-50/95 p-1 shadow-sm";

/** يصلح تمييز التبويب النشط داخل اللوحة الفاتحة (بدل ثيم الموقع الداكن الافتراضي) */
export const adminTabsTrigger =
  "rounded-lg px-3 py-2 font-display text-sm text-slate-600 transition-all data-[state=active]:bg-white data-[state=active]:font-semibold data-[state=active]:text-violet-900 data-[state=active]:shadow-sm";

/** محتوى نوافذ الحوار — خلفية فاتحة ومتناسقة (لا تعتمد على ثيم الموقع الداكن) */
export const adminDialogSurface =
  "border-slate-200/95 bg-white text-slate-900 shadow-[0_28px_72px_-24px_rgba(15,23,42,0.38)] sm:rounded-2xl";

/** تنبيه تأكيد */
export const adminAlertSurface = "border-slate-200 bg-white text-slate-900 shadow-xl sm:rounded-2xl";

/** أيقونة عنوان الصفحة */
export const adminTitleIcon = "h-7 w-7 shrink-0 text-violet-600";

/** دمج سطح نافذة مع أصناف إضافية */
export function adminDialogClass(...extra: (string | undefined)[]): string {
  return cn(adminDialogSurface, ...extra);
}

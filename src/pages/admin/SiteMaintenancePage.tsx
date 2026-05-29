import { useState } from "react";
import { Construction, Power, PowerOff } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SITE_SHUTDOWN_CONFIRM_PASSWORD } from "@/config/ownerAuth";
import { setSiteMaintenanceActive, useSiteMaintenance } from "@/lib/siteMaintenance";

const SiteMaintenancePage = () => {
  const maintenance = useSiteMaintenance();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [targetActive, setTargetActive] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState("");

  const openConfirm = (active: boolean) => {
    setTargetActive(active);
    setConfirmPassword("");
    setDialogOpen(true);
  };

  const applyChange = () => {
    if (confirmPassword !== SITE_SHUTDOWN_CONFIRM_PASSWORD) {
      toast.error("رمز التأكيد غير صحيح");
      return;
    }
    setSiteMaintenanceActive(targetActive);
    setDialogOpen(false);
    setConfirmPassword("");
    toast.success(targetActive ? "تم إيقاف الموقع — يظهر للزوار وضع الصيانة" : "تم إعادة تشغيل الموقع");
  };

  const sinceLabel = maintenance.since
    ? new Date(maintenance.since).toLocaleString("ar", { dateStyle: "medium", timeStyle: "short" })
    : null;

  return (
    <div dir="rtl" className="mx-auto max-w-2xl space-y-6 px-4 py-8 md:px-0">
      <div className="rounded-2xl border border-violet-200/80 bg-white p-6 shadow-sm dark:border-slate-600 dark:bg-slate-900/90">
        <div className="flex items-start gap-4">
          <div
            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${
              maintenance.active ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700"
            }`}
          >
            <Construction className="h-6 w-6" />
          </div>
          <div className="min-w-0 flex-1 text-right">
            <h1 className="font-display text-xl font-bold text-slate-900 dark:text-slate-50">إيقاف الموقع</h1>
            <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
              عند التفعيل، يرى كل زائر للموقع العام رسالة «تحت الصيانة» في أي صفحة. لوحة التحكم وهذا الحساب
              يبقيان متاحين.
            </p>
            <p className="mt-4 text-sm font-medium text-slate-800 dark:text-slate-200">
              الحالة الحالية:{" "}
              <span className={maintenance.active ? "text-amber-700 dark:text-amber-400" : "text-emerald-700 dark:text-emerald-400"}>
                {maintenance.active ? "الموقع متوقف (صيانة)" : "الموقع يعمل"}
              </span>
            </p>
            {maintenance.active && sinceLabel ? (
              <p className="mt-1 text-xs text-slate-500">منذ: {sinceLabel}</p>
            ) : null}
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          {!maintenance.active ? (
            <Button
              type="button"
              variant="destructive"
              className="gap-2"
              onClick={() => openConfirm(true)}
            >
              <PowerOff className="h-4 w-4" />
              إيقاف الموقع
            </Button>
          ) : (
            <Button type="button" className="gap-2 bg-emerald-600 hover:bg-emerald-700" onClick={() => openConfirm(false)}>
              <Power className="h-4 w-4" />
              إعادة تشغيل الموقع
            </Button>
          )}
        </div>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent dir="rtl" className="border-slate-200 bg-white text-slate-900 sm:rounded-2xl">
          <DialogHeader className="text-right">
            <DialogTitle>{targetActive ? "تأكيد إيقاف الموقع" : "تأكيد إعادة التشغيل"}</DialogTitle>
            <DialogDescription className="text-right text-slate-600">
              {targetActive
                ? "أدخل رمز التأكيد لتفعيل وضع الصيانة على الموقع العام."
                : "أدخل رمز التأكيد لإعادة فتح الموقع للزوار."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 text-right">
            <Label htmlFor="maint-confirm">رمز التأكيد</Label>
            <Input
              id="maint-confirm"
              type="password"
              autoComplete="off"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="رمز التأكيد"
              className="text-right"
            />
          </div>
          <DialogFooter className="gap-2 sm:justify-start">
            <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
              إلغاء
            </Button>
            <Button type="button" variant={targetActive ? "destructive" : "default"} onClick={applyChange}>
              تأكيد
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SiteMaintenancePage;

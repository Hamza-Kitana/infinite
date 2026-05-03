import { type FormEvent, useMemo, useState } from "react";
import { Navigate } from "react-router-dom";
import { Trash2, UserPlus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SUPER_ADMIN_USERNAME } from "@/config/staffAuth";
import { useAuth } from "@/contexts/AuthContext";
import {
  INSTITUTION_ROSTER_STAFF_ROLES,
  institutionRosterStaffRoleLabelAr,
  isInstitutionRosterStaffRole,
} from "@/data/institutionBranches";
import {
  addManagedUser,
  loadManagedUsers,
  removeManagedUser,
  type ManagedStaffRole,
} from "@/staff/staffDirectory";
import { appendActivityLog } from "@/lib/activityLog";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const BASE_ROLES: { value: ManagedStaffRole; label: string }[] = [
  { value: "laws_editor", label: "محرر القوانين" },
  { value: "streamer_manager", label: "ستريمر منجر" },
  { value: "gang_manager", label: "مدير العصابات" },
  { value: "vip_cars_manager", label: "مدير سيارات VIP" },
  { value: "application_reviewer", label: "مراجع التقديمات" },
];

function roleLabel(role: ManagedStaffRole): string {
  if (isInstitutionRosterStaffRole(role)) return institutionRosterStaffRoleLabelAr(role);
  return BASE_ROLES.find((r) => r.value === role)?.label ?? role;
}

const StaffUsersPage = () => {
  const { isSuperAdmin, user } = useAuth();
  const [users, setUsers] = useState(() => loadManagedUsers());
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [selectedRoles, setSelectedRoles] = useState<Set<ManagedStaffRole>>(
    () => new Set(["laws_editor"]),
  );
  /** إعادة ضبط القائمة المنسدلة بعد كل اختيار ليعود placeholder */
  const [rolePickerKey, setRolePickerKey] = useState(0);

  const list = useMemo(() => users, [users]);

  const hasAvailableRoles = useMemo(() => {
    const baseLeft = BASE_ROLES.some((b) => !selectedRoles.has(b.value));
    const rosterLeft = INSTITUTION_ROSTER_STAFF_ROLES.some((r) => !selectedRoles.has(r));
    return baseLeft || rosterLeft;
  }, [selectedRoles]);

  if (!isSuperAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  const refresh = () => setUsers(loadManagedUsers());

  const addRoleFromPicker = (value: string) => {
    const r = value as ManagedStaffRole;
    setSelectedRoles((prev) => new Set([...prev, r]));
    setRolePickerKey((k) => k + 1);
  };

  const removeRole = (r: ManagedStaffRole) => {
    setSelectedRoles((prev) => {
      if (prev.size <= 1) {
        toast.error("يجب الإبقاء على دور واحد على الأقل");
        return prev;
      }
      const next = new Set(prev);
      next.delete(r);
      return next;
    });
  };

  const handleAdd = (e: FormEvent) => {
    e.preventDefault();
    const u = username.trim();
    if (u.length < 2) {
      toast.error("اسم المستخدم قصير جداً");
      return;
    }
    if (password.length < 1) {
      toast.error("أدخل كلمة مرور");
      return;
    }
    if (u.toLowerCase() === SUPER_ADMIN_USERNAME.toLowerCase()) {
      toast.error("هذا الاسم محجوز لحساب الإدارة");
      return;
    }
    if (loadManagedUsers().some((x) => x.username.toLowerCase() === u.toLowerCase())) {
      toast.error("هذا الاسم مستخدم مسبقاً");
      return;
    }
    const roles = Array.from(selectedRoles);
    if (roles.length === 0) {
      toast.error("اختر دوراً واحداً على الأقل");
      return;
    }
    try {
      addManagedUser({
        username: u,
        password,
        roles,
      });
    } catch (e) {
      const quotaFull =
        e instanceof DOMException && (e.name === "QuotaExceededError" || e.code === 22);
      toast.error(
        quotaFull
          ? "تعذر حفظ قائمة الموظفين حتى بعد تقليص سجل النشاط وطلبات التقديم المحفوظة. امسح بيانات الموقع من المتصفح أو احذف محتوى كبير (قوانين/صور) من التخزين المحلي."
          : "تعذر الحفظ: المتصفح قد يمنع التخزين المحلي (وضع خاص صارم، أو حظر الموقع). فعّل التخزين لهذا الموقع أو جرّب متصفحاً عادياً.",
      );
      return;
    }
    refresh();
    setUsername("");
    setPassword("");
    setSelectedRoles(new Set(["laws_editor"]));
    setRolePickerKey((k) => k + 1);
    try {
      appendActivityLog(user?.username ?? "super_admin", "إضافة مستخدم موظف", `${u} — أدوار: ${roles.map(roleLabel).join("، ")}`);
    } catch {
      /* سجل النشاط اختياري — لا نمنع نجاح الإضافة */
    }
    toast.success("تم إضافة المستخدم");
  };

  const handleRemove = (id: string, uname: string) => {
    try {
      removeManagedUser(id);
    } catch {
      toast.error("تعذر حذف المستخدم من التخزين المحلي.");
      return;
    }
    refresh();
    try {
      appendActivityLog(user?.username ?? "super_admin", "حذف مستخدم موظف", uname);
    } catch {
      /* ignore */
    }
    toast.success("تم الحذف");
  };

  return (
    <div className="mx-auto max-w-3xl space-y-10">
      <div className="text-right">
        <h1 className="font-display text-2xl font-bold text-slate-800 dark:text-slate-100">المستخدمون والأدوار</h1>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
          اختر الأدوار من القائمة المنسدلة؛ تظهر الأدوار المختارة أسفلها ويمكن إزالة أي دور ما عدا الأخير. طواقم المؤسسات: دور مستقل لكل فرع.
        </p>
      </div>

      <form
        noValidate
        onSubmit={handleAdd}
        className="rounded-2xl border border-slate-200/90 bg-white p-6 text-right shadow-sm dark:border-slate-700/80 dark:bg-slate-900/50 space-y-5"
      >
        <h2 className="font-display text-lg font-semibold flex items-center gap-2 justify-end text-slate-800 dark:text-slate-100">
          <UserPlus className="h-5 w-5 text-sky-600 dark:text-sky-400" />
          إضافة مستخدم
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="nu">اسم المستخدم</Label>
            <Input
              id="nu"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="mt-1.5 border-slate-200 dark:border-slate-700"
              autoComplete="off"
            />
          </div>
          <div>
            <Label htmlFor="np">كلمة المرور</Label>
            <Input
              id="np"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1.5 border-slate-200 dark:border-slate-700"
              autoComplete="new-password"
            />
          </div>
        </div>

        <div className="space-y-3">
          <Label htmlFor="role-picker">إضافة دور</Label>
          <Select
            key={rolePickerKey}
            required={false}
            disabled={!hasAvailableRoles}
            onValueChange={(v) => {
              if (v) addRoleFromPicker(v);
            }}
          >
            <SelectTrigger
              id="role-picker"
              className="mt-1.5 border-slate-200 text-right dark:border-slate-700 [&>span]:text-right"
              dir="rtl"
            >
              <SelectValue
                placeholder={
                  hasAvailableRoles ? "اختر دوراً من القائمة لإضافته" : "تم اختيار كل الأدوار المتاحة"
                }
              />
            </SelectTrigger>
            <SelectContent dir="rtl" className="max-h-[min(70vh,24rem)]">
              {BASE_ROLES.some((b) => !selectedRoles.has(b.value)) ? (
                <SelectGroup>
                  <SelectLabel className="text-right">أدوار عامة</SelectLabel>
                  {BASE_ROLES.filter((b) => !selectedRoles.has(b.value)).map((b) => (
                    <SelectItem key={b.value} value={b.value} className="text-right">
                      {b.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              ) : null}
              {INSTITUTION_ROSTER_STAFF_ROLES.some((r) => !selectedRoles.has(r)) ? (
                <SelectGroup>
                  <SelectLabel className="text-right">طواقم المؤسسات</SelectLabel>
                  {INSTITUTION_ROSTER_STAFF_ROLES.filter((r) => !selectedRoles.has(r)).map((r) => (
                    <SelectItem key={r} value={r} className="text-right">
                      {institutionRosterStaffRoleLabelAr(r)}
                    </SelectItem>
                  ))}
                </SelectGroup>
              ) : null}
            </SelectContent>
          </Select>

          <div>
            <p className="mb-2 text-xs font-medium text-slate-500 dark:text-slate-400">الأدوار المختارة</p>
            <div className="flex min-h-[2.5rem] flex-wrap justify-end gap-2 rounded-xl border border-slate-100 bg-slate-50/90 p-3 dark:border-slate-800 dark:bg-slate-950/50">
              {Array.from(selectedRoles).map((r) => (
                <span
                  key={r}
                  className={cn(
                    "inline-flex max-w-full items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium shadow-sm",
                    "border-sky-200 bg-sky-50 text-sky-900 dark:border-sky-800 dark:bg-sky-950/80 dark:text-sky-100",
                  )}
                >
                  <span className="truncate">{roleLabel(r)}</span>
                  <button
                    type="button"
                    className="shrink-0 rounded-full p-0.5 text-sky-700 transition-colors hover:bg-sky-200/80 hover:text-sky-950 dark:text-sky-200 dark:hover:bg-sky-800 dark:hover:text-white"
                    aria-label={`إزالة ${roleLabel(r)}`}
                    onClick={() => removeRole(r)}
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </span>
              ))}
            </div>
          </div>
        </div>

        <Button type="submit" className="w-full sm:w-auto bg-sky-600 text-white hover:bg-sky-700 font-display">
          إضافة
        </Button>
      </form>

      <div className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm dark:border-slate-700/80 dark:bg-slate-900/50">
        <div className="border-b border-slate-100 px-4 py-3 text-right font-display text-sm font-semibold text-slate-700 dark:border-slate-800 dark:text-slate-200">
          المستخدمون ({list.length})
        </div>
        <ul className="divide-y divide-slate-100 dark:divide-slate-800">
          {list.length === 0 ? (
            <li className="px-4 py-8 text-center text-sm text-slate-500">لا يوجد مستخدمون بعد.</li>
          ) : (
            list.map((u) => (
              <li
                key={u.id}
                className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 text-right"
              >
                <div>
                  <p className="font-medium text-slate-800 dark:text-slate-100">{u.username}</p>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    {u.roles.map((role) => roleLabel(role)).join(" · ")}
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="text-destructive border-destructive/40 hover:bg-destructive/10"
                  onClick={() => handleRemove(u.id, u.username)}
                >
                  <Trash2 className="h-4 w-4 ms-1" />
                  حذف
                </Button>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
};

export default StaffUsersPage;

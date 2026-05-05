import { type FormEvent, useMemo, useState } from "react";
import { Navigate } from "react-router-dom";
import { Pencil, Trash2, UserPlus, X } from "lucide-react";
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
  updateManagedUser,
  type ManagedStaffRole,
} from "@/staff/staffDirectory";
import { appendActivityLog } from "@/lib/activityLog";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

type PublicUserRow = {
  id: string;
  username: string;
  realName: string;
  fullName: string;
  email: string;
  discordId: string;
  age: number;
  password: string;
  isActive: boolean;
  createdAt: string;
};

function loadPublicUsersForAdmin(): PublicUserRow[] {
  try {
    const raw = localStorage.getItem("ic_public_users_v1");
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((x): x is Record<string, unknown> => !!x && typeof x === "object")
      .map((x) => ({
        id: typeof x.id === "string" ? x.id : crypto.randomUUID(),
        username: typeof x.username === "string" ? x.username : "—",
        realName: typeof x.realName === "string" ? x.realName : "—",
        fullName: typeof x.fullName === "string" ? x.fullName : "—",
        email: typeof x.email === "string" ? x.email : "—",
        discordId: typeof x.discordId === "string" ? x.discordId : "—",
        age: typeof x.age === "number" ? x.age : 0,
        password: typeof x.password === "string" ? x.password : "",
        isActive: x.isActive !== false,
        createdAt: typeof x.createdAt === "string" ? x.createdAt : "",
      }));
  } catch {
    return [];
  }
}

function savePublicUsersForAdmin(users: PublicUserRow[]) {
  localStorage.setItem(
    "ic_public_users_v1",
    JSON.stringify(
      users.map((u) => ({
        id: u.id,
        username: u.username,
        realName: u.realName,
        fullName: u.fullName,
        email: u.email,
        discordId: u.discordId,
        age: u.age,
        password: u.password,
        displayName: u.fullName,
        isActive: u.isActive,
        createdAt: u.createdAt,
      })),
    ),
  );
}

const BASE_ROLES: { value: ManagedStaffRole; label: string }[] = [
  { value: "laws_editor", label: "محرر القوانين" },
  { value: "streamer_manager", label: "ستريمر منجر" },
  { value: "gang_manager", label: "مدير العصابات" },
  { value: "vip_cars_manager", label: "مدير سيارات VIP" },
  { value: "application_reviewer", label: "مراجع التقديمات" },
  { value: "about_manager", label: "مدير من نحن" },
  { value: "ticket_support_manager", label: "تكت — دعم فني" },
  { value: "ticket_admin_inquiry_manager", label: "تكت — استفسار إداري" },
  { value: "ticket_player_complaint_manager", label: "تكت — شكوى لاعب" },
  { value: "ticket_compensation_manager", label: "تكت — طلب تعويض" },
  { value: "ticket_store_manager", label: "تكت — طلب متجر" },
  { value: "ticket_general_manager", label: "تكت — عام" },
  { value: "footer_manager", label: "مدير الفوتر" },
];

function roleLabel(role: ManagedStaffRole): string {
  if (isInstitutionRosterStaffRole(role)) return institutionRosterStaffRoleLabelAr(role);
  return BASE_ROLES.find((r) => r.value === role)?.label ?? role;
}

function rolesPickerHasMore(selected: Set<ManagedStaffRole>): boolean {
  const baseLeft = BASE_ROLES.some((b) => !selected.has(b.value));
  const rosterLeft = INSTITUTION_ROSTER_STAFF_ROLES.some((r) => !selected.has(r));
  return baseLeft || rosterLeft;
}

const StaffUsersPage = () => {
  const { isSuperAdmin, user } = useAuth();
  const [users, setUsers] = useState(() => loadManagedUsers());
  const [publicUsers, setPublicUsers] = useState<PublicUserRow[]>(() => loadPublicUsersForAdmin());
  const [searchQuery, setSearchQuery] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [selectedRoles, setSelectedRoles] = useState<Set<ManagedStaffRole>>(() => new Set());
  /** إعادة ضبط القائمة المنسدلة بعد كل اختيار ليعود placeholder */
  const [rolePickerKey, setRolePickerKey] = useState(0);

  type EditFormState = {
    id: string;
    username: string;
    password: string;
    roles: Set<ManagedStaffRole>;
  };
  const [editOpen, setEditOpen] = useState(false);
  const [editForm, setEditForm] = useState<EditFormState | null>(null);
  const [editRolePickerKey, setEditRolePickerKey] = useState(0);
  const [addPublicOpen, setAddPublicOpen] = useState(false);
  const [publicForm, setPublicForm] = useState({
    username: "",
    realName: "",
    fullName: "",
    email: "",
    discordId: "",
    age: "",
    password: "",
  });
  const [editPublicOpen, setEditPublicOpen] = useState(false);
  const [editPublicForm, setEditPublicForm] = useState<PublicUserRow | null>(null);

  const list = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return users;
    return users.filter((u) => u.username.toLowerCase().includes(q));
  }, [users, searchQuery]);
  const publicList = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return publicUsers;
    return publicUsers.filter((u) =>
      `${u.username} ${u.realName} ${u.fullName} ${u.email}`.toLowerCase().includes(q),
    );
  }, [publicUsers, searchQuery]);

  const hasAvailableRoles = useMemo(() => rolesPickerHasMore(selectedRoles), [selectedRoles]);
  const editHasAvailableRoles = useMemo(
    () => (editForm ? rolesPickerHasMore(editForm.roles) : false),
    [editForm],
  );

  if (!isSuperAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  const refresh = () => {
    setUsers(loadManagedUsers());
    setPublicUsers(loadPublicUsersForAdmin());
  };

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
    setSelectedRoles(new Set());
    setRolePickerKey((k) => k + 1);
    setAddOpen(false);
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

  const handleToggleStaffUser = (id: string, uname: string, isActive: boolean) => {
    try {
      updateManagedUser(id, { isActive: !isActive });
    } catch {
      toast.error("تعذر تعديل حالة المستخدم.");
      return;
    }
    refresh();
    try {
      appendActivityLog(user?.username ?? "super_admin", isActive ? "إيقاف مستخدم موظف" : "تفعيل مستخدم موظف", uname);
    } catch {
      /* ignore */
    }
    toast.success(isActive ? "تم إيقاف الحساب" : "تم تفعيل الحساب");
  };

  const openEdit = (id: string, uname: string, roles: ManagedStaffRole[]) => {
    setEditForm({
      id,
      username: uname,
      password: "",
      roles: new Set(roles),
    });
    setEditRolePickerKey((k) => k + 1);
    setEditOpen(true);
  };

  const addEditRoleFromPicker = (value: string) => {
    const r = value as ManagedStaffRole;
    setEditForm((prev) => (prev ? { ...prev, roles: new Set([...prev.roles, r]) } : prev));
    setEditRolePickerKey((k) => k + 1);
  };

  const removeEditRole = (r: ManagedStaffRole) => {
    setEditForm((prev) => {
      if (!prev) return prev;
      if (prev.roles.size <= 1) {
        toast.error("يجب الإبقاء على دور واحد على الأقل");
        return prev;
      }
      const next = new Set(prev.roles);
      next.delete(r);
      return { ...prev, roles: next };
    });
  };

  const handleEditSave = (e: FormEvent) => {
    e.preventDefault();
    if (!editForm) return;
    const u = editForm.username.trim();
    if (u.length < 2) {
      toast.error("اسم المستخدم قصير جداً");
      return;
    }
    if (u.toLowerCase() === SUPER_ADMIN_USERNAME.toLowerCase()) {
      toast.error("هذا الاسم محجوز لحساب الإدارة");
      return;
    }
    if (
      loadManagedUsers().some((x) => x.id !== editForm.id && x.username.toLowerCase() === u.toLowerCase())
    ) {
      toast.error("هذا الاسم مستخدم مسبقاً لمستخدم آخر");
      return;
    }
    const roles = Array.from(editForm.roles);
    if (roles.length === 0) {
      toast.error("اختر دوراً واحداً على الأقل");
      return;
    }
    const patch: { username: string; roles: ManagedStaffRole[]; password?: string } = {
      username: u,
      roles,
    };
    if (editForm.password.trim().length > 0) {
      patch.password = editForm.password;
    }
    try {
      updateManagedUser(editForm.id, patch);
    } catch (err) {
      const quotaFull =
        err instanceof DOMException && (err.name === "QuotaExceededError" || err.code === 22);
      toast.error(
        quotaFull
          ? "تعذر الحفظ بعد محاولة تفريغ المساحة. امسح بيانات الموقع من المتصفح أو احذف محتوى كبير من التخزين المحلي."
          : "تعذر الحفظ: تحقق من إعدادات التخزين في المتصفح.",
      );
      return;
    }
    refresh();
    try {
      appendActivityLog(
        user?.username ?? "super_admin",
        "تعديل مستخدم موظف",
        `${u} — أدوار: ${roles.map(roleLabel).join("، ")}${patch.password ? " — تم تغيير كلمة المرور" : ""}`,
      );
    } catch {
      /* ignore */
    }
    toast.success("تم حفظ التعديلات");
    setEditOpen(false);
    setEditForm(null);
  };

  const handleAddPublicUser = (e: FormEvent) => {
    e.preventDefault();
    const username = publicForm.username.trim().toLowerCase();
    const realName = publicForm.realName.trim();
    const fullName = publicForm.fullName.trim();
    const email = publicForm.email.trim().toLowerCase();
    const discordId = publicForm.discordId.trim();
    const age = Number(publicForm.age);
    const password = publicForm.password;
    if (username.length < 3 || realName.length < 3 || fullName.length < 3) {
      toast.error("أدخل بيانات صحيحة (الاسم/اسم المستخدم)");
      return;
    }
    if (!email.includes("@")) {
      toast.error("الإيميل غير صحيح");
      return;
    }
    if (!Number.isFinite(age) || age < 13) {
      toast.error("العمر يجب أن يكون 13 أو أكثر");
      return;
    }
    if (password.length < 4) {
      toast.error("كلمة المرور قصيرة");
      return;
    }
    if (publicUsers.some((u) => u.username.toLowerCase() === username)) {
      toast.error("اسم المستخدم مستخدم مسبقاً");
      return;
    }
    const next: PublicUserRow = {
      id: crypto.randomUUID(),
      username,
      realName,
      fullName,
      email,
      discordId,
      age: Math.floor(age),
      password,
      isActive: true,
      createdAt: new Date().toISOString(),
    };
    savePublicUsersForAdmin([...publicUsers, next]);
    refresh();
    setPublicForm({ username: "", realName: "", fullName: "", email: "", discordId: "", age: "", password: "" });
    setAddPublicOpen(false);
    appendActivityLog(user?.username ?? "super_admin", "إضافة مستخدم عادي", `${username} — ${fullName}`);
    toast.success("تمت إضافة المستخدم العادي");
  };

  const handleSavePublicEdit = (e: FormEvent) => {
    e.preventDefault();
    if (!editPublicForm) return;
    const username = editPublicForm.username.trim().toLowerCase();
    const realName = editPublicForm.realName.trim();
    const fullName = editPublicForm.fullName.trim();
    const email = editPublicForm.email.trim().toLowerCase();
    const discordId = editPublicForm.discordId.trim();
    const age = Number(editPublicForm.age);
    if (username.length < 3 || realName.length < 3 || fullName.length < 3) {
      toast.error("أدخل بيانات صحيحة");
      return;
    }
    if (!email.includes("@")) {
      toast.error("الإيميل غير صحيح");
      return;
    }
    if (!Number.isFinite(age) || age < 13) {
      toast.error("العمر يجب أن يكون 13 أو أكثر");
      return;
    }
    if (publicUsers.some((u) => u.id !== editPublicForm.id && u.username.toLowerCase() === username)) {
      toast.error("اسم المستخدم مستخدم مسبقاً");
      return;
    }
    const next = publicUsers.map((u) =>
      u.id === editPublicForm.id
        ? {
            ...u,
            username,
            realName,
            fullName,
            email,
            discordId,
            age: Math.floor(age),
            password: editPublicForm.password,
            isActive: editPublicForm.isActive,
          }
        : u,
    );
    savePublicUsersForAdmin(next);
    refresh();
    setEditPublicOpen(false);
    setEditPublicForm(null);
    appendActivityLog(user?.username ?? "super_admin", "تعديل مستخدم عادي", `${username} — ${fullName}`);
    toast.success("تم حفظ تعديل المستخدم");
  };

  const handleTogglePublicUser = (id: string) => {
    const target = publicUsers.find((u) => u.id === id);
    if (!target) return;
    const next = publicUsers.map((u) => (u.id === id ? { ...u, isActive: !u.isActive } : u));
    savePublicUsersForAdmin(next);
    refresh();
    appendActivityLog(
      user?.username ?? "super_admin",
      target.isActive ? "إيقاف مستخدم عادي" : "تفعيل مستخدم عادي",
      `${target.username} — ${target.fullName}`,
    );
    toast.success(target.isActive ? "تم إيقاف الحساب" : "تم تفعيل الحساب");
  };

  const handleDeletePublicUser = (id: string) => {
    const target = publicUsers.find((u) => u.id === id);
    if (!target) return;
    savePublicUsersForAdmin(publicUsers.filter((u) => u.id !== id));
    refresh();
    appendActivityLog(user?.username ?? "super_admin", "حذف مستخدم عادي", `${target.username} — ${target.fullName}`);
    toast.success("تم حذف المستخدم العادي");
  };

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <div className="flex flex-col-reverse gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="text-right">
          <h1 className="font-display text-2xl font-bold text-slate-900">المستخدمون والأدوار</h1>
          <p className="mt-2 text-sm text-slate-600">
            اختر الأدوار من القائمة المنسدلة؛ تظهر الأدوار المختارة أسفلها ويمكن إزالة أي دور ما عدا الأخير. طواقم المؤسسات: دور مستقل لكل فرع.
          </p>
        </div>
        <div className="flex justify-end">
          <div className="flex gap-2">
            <Button
              type="button"
              className="bg-violet-600 font-display text-white hover:bg-violet-700"
              onClick={() => setAddPublicOpen(true)}
            >
              <UserPlus className="ms-2 h-4 w-4" />
              إضافة مستخدم عادي
            </Button>
            <Button
              type="button"
              className="bg-[#36164f] font-display text-white hover:bg-[#2f1344]"
              onClick={() => setAddOpen(true)}
            >
              <UserPlus className="ms-2 h-4 w-4" />
              إضافة مستخدم موظف
            </Button>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-violet-200/80 bg-white/90 p-4 shadow-[0_14px_34px_-24px_rgba(54,22,79,0.45)]">
        <div className="text-right">
          <Label htmlFor="user-search" className="text-slate-700">البحث عن مستخدم</Label>
          <Input
            id="user-search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="mt-1.5 border-violet-200 bg-violet-50/40 text-slate-900 placeholder:text-slate-400 focus-visible:ring-violet-400"
            placeholder="اكتب اسم المستخدم للبحث..."
            autoComplete="off"
          />
        </div>
      </div>

      <Dialog
        open={addOpen}
        onOpenChange={(open) => {
          setAddOpen(open);
          if (!open) {
            setUsername("");
            setPassword("");
            setSelectedRoles(new Set());
            setRolePickerKey((k) => k + 1);
          }
        }}
      >
        <DialogContent
          dir="rtl"
          className="max-h-[min(90dvh,40rem)] overflow-y-auto border-violet-300 bg-[#f7f1fc] text-right shadow-[0_24px_60px_-32px_rgba(54,22,79,0.55)] sm:max-w-lg"
        >
          <DialogHeader>
            <DialogTitle className="font-display text-slate-900">إضافة مستخدم جديد</DialogTitle>
            <DialogDescription className="text-slate-600">
              عبّي المعلومات واختر الرتب المناسبة، ويمكن إضافة أكثر من رتبة لنفس المستخدم.
            </DialogDescription>
          </DialogHeader>
          <form noValidate onSubmit={handleAdd} className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="nu" className="text-slate-700">اسم المستخدم</Label>
                <Input
                  id="nu"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="mt-1.5 border-violet-200 bg-violet-50/40 text-slate-900 placeholder:text-slate-400 focus-visible:ring-violet-400"
                  autoComplete="off"
                  placeholder="مثال: staff_moderator"
                />
              </div>
              <div>
                <Label htmlFor="np" className="text-slate-700">كلمة المرور</Label>
                <Input
                  id="np"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-1.5 border-violet-200 bg-violet-50/40 text-slate-900 placeholder:text-slate-400 focus-visible:ring-violet-400"
                  autoComplete="new-password"
                  placeholder="ادخل كلمة مرور قوية"
                />
              </div>
            </div>

            <div className="space-y-3">
              <Label htmlFor="role-picker" className="text-slate-700">اختيار الرتب</Label>
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
                  type="button"
                  className="mt-1.5 border-violet-200 bg-violet-50/40 text-right data-[placeholder]:text-slate-700 [&>span]:text-right [&>span]:text-slate-700 focus:ring-violet-400"
                  dir="rtl"
                >
                  <SelectValue
                    className="text-slate-700 data-[placeholder]:text-slate-700"
                    placeholder={
                      hasAvailableRoles ? "اختر دوراً من القائمة لإضافته" : "تم اختيار كل الأدوار المتاحة"
                    }
                  />
                </SelectTrigger>
                <SelectContent dir="rtl" className="max-h-[min(70vh,24rem)] border-violet-200 bg-white">
                  {BASE_ROLES.some((b) => !selectedRoles.has(b.value)) ? (
                    <SelectGroup>
                      <SelectLabel className="text-right text-slate-500">أدوار عامة</SelectLabel>
                      {BASE_ROLES.filter((b) => !selectedRoles.has(b.value)).map((b) => (
                        <SelectItem key={b.value} value={b.value} className="text-right text-slate-800 focus:bg-violet-50 focus:text-violet-900">
                          {b.label}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  ) : null}
                  {INSTITUTION_ROSTER_STAFF_ROLES.some((r) => !selectedRoles.has(r)) ? (
                    <SelectGroup>
                      <SelectLabel className="text-right text-slate-500">طواقم المؤسسات</SelectLabel>
                      {INSTITUTION_ROSTER_STAFF_ROLES.filter((r) => !selectedRoles.has(r)).map((r) => (
                        <SelectItem key={r} value={r} className="text-right text-slate-800 focus:bg-violet-50 focus:text-violet-900">
                          {institutionRosterStaffRoleLabelAr(r)}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  ) : null}
                </SelectContent>
              </Select>

              <div>
                <p className="mb-2 text-xs font-medium text-slate-500">الأدوار المختارة</p>
                <div className="flex min-h-[2.5rem] flex-wrap justify-end gap-2 rounded-xl border border-violet-200 bg-violet-50/55 p-3">
                  {Array.from(selectedRoles).map((r) => (
                    <span
                      key={r}
                      className={cn(
                        "inline-flex max-w-full items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium shadow-sm",
                        "border-violet-300 bg-white text-violet-900",
                      )}
                    >
                      <span className="truncate">{roleLabel(r)}</span>
                      <button
                        type="button"
                        className="shrink-0 rounded-full p-0.5 text-violet-700 transition-colors hover:bg-violet-200/80 hover:text-violet-950"
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

            <DialogFooter className="gap-2 sm:justify-start">
              <Button
                type="button"
                variant="outline"
                className="border-violet-200 bg-white text-violet-700 hover:bg-violet-50"
                onClick={() => setAddOpen(false)}
              >
                إلغاء
              </Button>
              <Button type="submit" className="bg-[#36164f] text-white hover:bg-[#2f1344]">
                إضافة
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog
        open={addPublicOpen}
        onOpenChange={(open) => {
          setAddPublicOpen(open);
          if (!open) {
            setPublicForm({ username: "", realName: "", fullName: "", email: "", discordId: "", age: "", password: "" });
          }
        }}
      >
        <DialogContent dir="rtl" className="max-h-[min(90dvh,40rem)] overflow-y-auto border-violet-300 bg-[#f7f1fc] text-right sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-display text-slate-900">إضافة مستخدم عادي</DialogTitle>
            <DialogDescription className="text-slate-600">إنشاء حساب مستخدم عادي من لوحة السوبر أدمن.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddPublicUser} className="space-y-3" noValidate>
            <Input value={publicForm.username} onChange={(e) => setPublicForm((p) => ({ ...p, username: e.target.value }))} placeholder="اسم المستخدم" className="border-violet-200 bg-white text-slate-900" />
            <Input value={publicForm.realName} onChange={(e) => setPublicForm((p) => ({ ...p, realName: e.target.value }))} placeholder="الاسم الحقيقي" className="border-violet-200 bg-white text-slate-900" />
            <Input value={publicForm.fullName} onChange={(e) => setPublicForm((p) => ({ ...p, fullName: e.target.value }))} placeholder="الاسم داخل المدينة" className="border-violet-200 bg-white text-slate-900" />
            <Input value={publicForm.email} onChange={(e) => setPublicForm((p) => ({ ...p, email: e.target.value }))} placeholder="الإيميل" className="border-violet-200 bg-white text-slate-900" dir="ltr" />
            <Input value={publicForm.discordId} onChange={(e) => setPublicForm((p) => ({ ...p, discordId: e.target.value }))} placeholder="Discord ID" className="border-violet-200 bg-white text-slate-900" />
            <Input value={publicForm.age} onChange={(e) => setPublicForm((p) => ({ ...p, age: e.target.value }))} placeholder="العمر" className="border-violet-200 bg-white text-slate-900" />
            <Input type="password" value={publicForm.password} onChange={(e) => setPublicForm((p) => ({ ...p, password: e.target.value }))} placeholder="كلمة المرور" className="border-violet-200 bg-white text-slate-900" />
            <DialogFooter className="gap-2 sm:justify-start">
              <Button type="button" variant="outline" className="border-violet-200 bg-white text-violet-700 hover:bg-violet-50" onClick={() => setAddPublicOpen(false)}>إلغاء</Button>
              <Button type="submit" className="bg-violet-600 text-white hover:bg-violet-700">إضافة</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog
        open={editOpen}
        onOpenChange={(open) => {
          setEditOpen(open);
          if (!open) setEditForm(null);
        }}
      >
        <DialogContent
          dir="rtl"
          className="max-h-[min(90dvh,40rem)] overflow-y-auto border-violet-300 bg-[#f7f1fc] text-right shadow-[0_24px_60px_-32px_rgba(54,22,79,0.55)] sm:max-w-lg"
        >
          <DialogHeader>
            <DialogTitle className="font-display text-slate-900">تعديل مستخدم</DialogTitle>
            <DialogDescription className="text-slate-600">
              غيّر اسم المستخدم والأدوار؛ اترك كلمة المرور فارغة إن لم ترد تغييرها.
            </DialogDescription>
          </DialogHeader>
          {editForm ? (
            <form onSubmit={handleEditSave} className="space-y-4" noValidate>
              <div>
                <Label htmlFor="edit-user" className="text-slate-700">اسم المستخدم</Label>
                <Input
                  id="edit-user"
                  value={editForm.username}
                  onChange={(e) => setEditForm((prev) => (prev ? { ...prev, username: e.target.value } : prev))}
                  className="mt-1.5 border-violet-200 bg-violet-50/40 text-slate-900 placeholder:text-slate-400 focus-visible:ring-violet-400"
                  autoComplete="off"
                />
              </div>
              <div>
                <Label htmlFor="edit-pass" className="text-slate-700">كلمة مرور جديدة (اختياري)</Label>
                <Input
                  id="edit-pass"
                  type="password"
                  value={editForm.password}
                  onChange={(e) => setEditForm((prev) => (prev ? { ...prev, password: e.target.value } : prev))}
                  className="mt-1.5 border-violet-200 bg-violet-50/40 text-slate-900 placeholder:text-slate-400 focus-visible:ring-violet-400"
                  autoComplete="new-password"
                  placeholder="اتركها فارغة للإبقاء على الحالية"
                />
              </div>
              <div className="space-y-3">
                <Label htmlFor="edit-role-picker" className="text-slate-700">إضافة دور</Label>
                <Select
                  key={editRolePickerKey}
                  required={false}
                  disabled={!editHasAvailableRoles}
                  onValueChange={(v) => {
                    if (v) addEditRoleFromPicker(v);
                  }}
                >
                  <SelectTrigger
                    id="edit-role-picker"
                    type="button"
                    className="mt-1.5 border-violet-200 bg-violet-50/40 text-right data-[placeholder]:text-slate-700 [&>span]:text-right [&>span]:text-slate-700 focus:ring-violet-400"
                    dir="rtl"
                  >
                    <SelectValue
                      className="text-slate-700 data-[placeholder]:text-slate-700"
                      placeholder={
                        editHasAvailableRoles ? "اختر دوراً لإضافته" : "تم اختيار كل الأدوار المتاحة"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent dir="rtl" className="max-h-[min(70vh,24rem)] border-violet-200 bg-white">
                    {BASE_ROLES.some((b) => !editForm.roles.has(b.value)) ? (
                      <SelectGroup>
                        <SelectLabel className="text-right text-slate-500">أدوار عامة</SelectLabel>
                        {BASE_ROLES.filter((b) => !editForm.roles.has(b.value)).map((b) => (
                          <SelectItem key={b.value} value={b.value} className="text-right text-slate-800 focus:bg-violet-50 focus:text-violet-900">
                            {b.label}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    ) : null}
                    {INSTITUTION_ROSTER_STAFF_ROLES.some((r) => !editForm.roles.has(r)) ? (
                      <SelectGroup>
                        <SelectLabel className="text-right text-slate-500">طواقم المؤسسات</SelectLabel>
                        {INSTITUTION_ROSTER_STAFF_ROLES.filter((r) => !editForm.roles.has(r)).map((r) => (
                          <SelectItem key={r} value={r} className="text-right text-slate-800 focus:bg-violet-50 focus:text-violet-900">
                            {institutionRosterStaffRoleLabelAr(r)}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    ) : null}
                  </SelectContent>
                </Select>
                <div>
                  <p className="mb-2 text-xs font-medium text-slate-500">الأدوار المختارة</p>
                  <div className="flex min-h-[2.5rem] flex-wrap justify-end gap-2 rounded-xl border border-violet-200 bg-violet-50/55 p-3">
                    {Array.from(editForm.roles).map((r) => (
                      <span
                        key={r}
                        className={cn(
                          "inline-flex max-w-full items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium shadow-sm",
                          "border-violet-300 bg-white text-violet-900",
                        )}
                      >
                        <span className="truncate">{roleLabel(r)}</span>
                        <button
                          type="button"
                          className="shrink-0 rounded-full p-0.5 text-violet-700 transition-colors hover:bg-violet-200/80"
                          aria-label={`إزالة ${roleLabel(r)}`}
                          onClick={() => removeEditRole(r)}
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              <DialogFooter className="gap-2 sm:justify-start">
                <Button
                  type="button"
                  variant="outline"
                  className="border-violet-200 bg-white text-violet-700 hover:bg-violet-50"
                  onClick={() => {
                    setEditOpen(false);
                    setEditForm(null);
                  }}
                >
                  إلغاء
                </Button>
                <Button type="submit" className="bg-[#36164f] text-white hover:bg-[#2f1344]">
                  حفظ التعديلات
                </Button>
              </DialogFooter>
            </form>
          ) : null}
        </DialogContent>
      </Dialog>

      <div className="overflow-hidden rounded-2xl border border-violet-200/80 bg-white/95 shadow-[0_18px_44px_-28px_rgba(54,22,79,0.45)]">
        <div className="border-b border-violet-100 px-4 py-3 text-right font-display text-sm font-semibold text-slate-800">
          المستخدمون ({list.length})
        </div>
        <ul className="divide-y divide-violet-100">
          {list.length === 0 ? (
            <li className="px-4 py-8 text-center text-sm text-slate-500">
              {searchQuery.trim() ? "لا توجد نتائج مطابقة للبحث." : "لا يوجد مستخدمون بعد."}
            </li>
          ) : (
            list.map((u) => (
              <li
                key={u.id}
                className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 text-right"
              >
                <div>
                  <p className="font-medium text-slate-900">
                    {u.username}
                    <span className={cn("ms-2 inline-flex rounded-full px-2 py-0.5 text-[11px]", u.isActive === false ? "bg-rose-50 text-rose-700" : "bg-emerald-50 text-emerald-700")}>
                      {u.isActive === false ? "موقوف" : "نشط"}
                    </span>
                  </p>
                  <p className="text-xs text-slate-600">
                    {u.roles.map((role) => roleLabel(role)).join(" · ")}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="border-violet-200 bg-white text-violet-700 hover:bg-violet-50"
                    onClick={() => openEdit(u.id, u.username, u.roles)}
                  >
                    <Pencil className="h-4 w-4 ms-1" />
                    تعديل
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className={cn("border", u.isActive === false ? "border-emerald-300 bg-emerald-50 text-emerald-800 hover:bg-emerald-100" : "border-amber-300 bg-amber-50 text-amber-800 hover:bg-amber-100")}
                    onClick={() => handleToggleStaffUser(u.id, u.username, u.isActive !== false)}
                  >
                    {u.isActive === false ? "تفعيل" : "إيقاف"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="border-rose-300 bg-rose-50 text-rose-800 hover:bg-rose-100"
                    onClick={() => handleRemove(u.id, u.username)}
                  >
                    <Trash2 className="h-4 w-4 ms-1" />
                    حذف
                  </Button>
                </div>
              </li>
            ))
          )}
        </ul>
      </div>

      <Dialog
        open={editPublicOpen}
        onOpenChange={(open) => {
          setEditPublicOpen(open);
          if (!open) setEditPublicForm(null);
        }}
      >
        <DialogContent dir="rtl" className="max-h-[min(90dvh,40rem)] overflow-y-auto border-violet-300 bg-[#f7f1fc] text-right sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-display text-slate-900">تعديل مستخدم عادي</DialogTitle>
            <DialogDescription className="text-slate-600">تعديل بيانات الحساب العادي أو إيقافه.</DialogDescription>
          </DialogHeader>
          {editPublicForm ? (
            <form onSubmit={handleSavePublicEdit} className="space-y-3" noValidate>
              <Input value={editPublicForm.username} onChange={(e) => setEditPublicForm((p) => (p ? { ...p, username: e.target.value } : p))} placeholder="اسم المستخدم" className="border-violet-200 bg-white text-slate-900" />
              <Input value={editPublicForm.realName} onChange={(e) => setEditPublicForm((p) => (p ? { ...p, realName: e.target.value } : p))} placeholder="الاسم الحقيقي" className="border-violet-200 bg-white text-slate-900" />
              <Input value={editPublicForm.fullName} onChange={(e) => setEditPublicForm((p) => (p ? { ...p, fullName: e.target.value } : p))} placeholder="الاسم داخل المدينة" className="border-violet-200 bg-white text-slate-900" />
              <Input value={editPublicForm.email} onChange={(e) => setEditPublicForm((p) => (p ? { ...p, email: e.target.value } : p))} placeholder="الإيميل" className="border-violet-200 bg-white text-slate-900" dir="ltr" />
              <Input value={editPublicForm.discordId} onChange={(e) => setEditPublicForm((p) => (p ? { ...p, discordId: e.target.value } : p))} placeholder="Discord ID" className="border-violet-200 bg-white text-slate-900" />
              <Input value={String(editPublicForm.age)} onChange={(e) => setEditPublicForm((p) => (p ? { ...p, age: Number(e.target.value) || 0 } : p))} placeholder="العمر" className="border-violet-200 bg-white text-slate-900" />
              <Input type="password" value={editPublicForm.password} onChange={(e) => setEditPublicForm((p) => (p ? { ...p, password: e.target.value } : p))} placeholder="كلمة المرور" className="border-violet-200 bg-white text-slate-900" />
              <div className="flex justify-end">
                <Button type="button" variant="outline" className={cn("border px-3", editPublicForm.isActive ? "border-amber-300 bg-amber-50 text-amber-800 hover:bg-amber-100" : "border-emerald-300 bg-emerald-50 text-emerald-800 hover:bg-emerald-100")} onClick={() => setEditPublicForm((p) => (p ? { ...p, isActive: !p.isActive } : p))}>
                  {editPublicForm.isActive ? "إيقاف الحساب" : "تفعيل الحساب"}
                </Button>
              </div>
              <DialogFooter className="gap-2 sm:justify-start">
                <Button type="button" variant="outline" className="border-violet-200 bg-white text-violet-700 hover:bg-violet-50" onClick={() => setEditPublicOpen(false)}>إلغاء</Button>
                <Button type="submit" className="bg-[#36164f] text-white hover:bg-[#2f1344]">حفظ التعديل</Button>
              </DialogFooter>
            </form>
          ) : null}
        </DialogContent>
      </Dialog>

      <div className="overflow-hidden rounded-2xl border border-violet-200/80 bg-white/95 shadow-[0_18px_44px_-28px_rgba(54,22,79,0.45)]">
        <div className="border-b border-violet-100 px-4 py-3 text-right font-display text-sm font-semibold text-slate-800">
          المواطنين ({publicList.length})
        </div>
        <ul className="divide-y divide-violet-100">
          {publicList.length === 0 ? (
            <li className="px-4 py-8 text-center text-sm text-slate-500">
              {searchQuery.trim() ? "لا توجد نتائج مطابقة للبحث." : "لا يوجد مستخدمون عاديون بعد."}
            </li>
          ) : (
            publicList.map((u) => (
              <li key={u.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 text-right">
                <div>
                  <p className="font-medium text-slate-900">
                    {u.username}
                    <span className={cn("ms-2 inline-flex rounded-full px-2 py-0.5 text-[11px]", u.isActive ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700")}>
                      {u.isActive ? "نشط" : "موقوف"}
                    </span>
                  </p>
                  <p className="text-xs text-slate-600">
                    داخل المدينة: {u.fullName} · الحقيقي: {u.realName}
                  </p>
                  <p className="text-xs text-slate-500">{u.email}</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs text-slate-500">
                    {u.createdAt ? new Date(u.createdAt).toLocaleString("ar") : "—"}
                  </span>
                  <Button type="button" variant="outline" size="sm" className="border-violet-200 bg-white text-violet-700 hover:bg-violet-50" onClick={() => { setEditPublicForm(u); setEditPublicOpen(true); }}>
                    <Pencil className="h-4 w-4 ms-1" />
                    تعديل
                  </Button>
                  <Button type="button" variant="outline" size="sm" className={cn("border", u.isActive ? "border-amber-300 bg-amber-50 text-amber-800 hover:bg-amber-100" : "border-emerald-300 bg-emerald-50 text-emerald-800 hover:bg-emerald-100")} onClick={() => handleTogglePublicUser(u.id)}>
                    {u.isActive ? "إيقاف" : "تفعيل"}
                  </Button>
                  <Button type="button" variant="outline" size="sm" className="border-rose-300 bg-rose-50 text-rose-800 hover:bg-rose-100" onClick={() => handleDeletePublicUser(u.id)}>
                    <Trash2 className="h-4 w-4 ms-1" />
                    حذف
                  </Button>
                </div>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
};

export default StaffUsersPage;

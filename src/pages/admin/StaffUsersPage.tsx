import { type FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { Navigate, Link } from "react-router-dom";
import {
  Crown,
  Layers,
  Pencil,
  Search,
  ShieldCheck,
  Trash2,
  UserCog,
  UserPlus,
  Users,
  X,
} from "lucide-react";
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
import { useRoleGroups } from "@/contexts/RoleGroupsContext";
import {
  INSTITUTION_ROSTER_STAFF_ROLES,
  institutionRosterStaffRoleLabelAr,
  isInstitutionRosterStaffRole,
} from "@/data/institutionBranches";
import {
  addManagedUser,
  findManagedUserByPublicId,
  loadManagedUsers,
  removeManagedUser,
  updateManagedUser,
  type ManagedStaffRole,
  type ManagedUser,
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
  authProvider?: "local" | "discord";
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
        authProvider: x.authProvider === "discord" || x.authProvider === "local" ? x.authProvider : undefined,
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
        authProvider: u.authProvider,
      })),
    ),
  );
}

const BASE_ROLES: { value: ManagedStaffRole; label: string }[] = [
  { value: "laws_editor", label: "محرر القوانين" },
  { value: "streamer_manager", label: "ستريمر منجر" },
  { value: "gang_manager", label: "مدير العصابات" },
  { value: "vip_cars_manager", label: "مدير سيارات VIP" },
  { value: "houses_manager", label: "مدير البيوت" },
  { value: "packages_manager", label: "مدير البكجات" },
  { value: "investments_manager", label: "مدير الاستثمار" },
  { value: "application_reviewer", label: "مراجع التقديمات" },
  { value: "about_manager", label: "مدير من نحن" },
  { value: "store_orders_manager", label: "طلبات المتاجر" },
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
  const { groups } = useRoleGroups();
  const [users, setUsers] = useState(() => loadManagedUsers());
  const [publicUsers, setPublicUsers] = useState<PublicUserRow[]>(() => loadPublicUsersForAdmin());
  const [searchQuery, setSearchQuery] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [selectedRoles, setSelectedRoles] = useState<Set<ManagedStaffRole>>(() => new Set());
  const [rolePickerKey, setRolePickerKey] = useState(0);
  const [groupPickerKey, setGroupPickerKey] = useState(0);
  const [appliedGroups, setAppliedGroups] = useState<string[]>([]);

  type EditFormState = {
    id: string;
    username: string;
    password: string;
    roles: Set<ManagedStaffRole>;
    appliedGroups: string[];
  };
  const [editOpen, setEditOpen] = useState(false);
  const [editForm, setEditForm] = useState<EditFormState | null>(null);
  const [editRolePickerKey, setEditRolePickerKey] = useState(0);
  const [editGroupPickerKey, setEditGroupPickerKey] = useState(0);
  const [editPublicOpen, setEditPublicOpen] = useState(false);
  const [editPublicForm, setEditPublicForm] = useState<PublicUserRow | null>(null);

  type PromoteState = {
    publicUser: PublicUserRow;
    roles: Set<ManagedStaffRole>;
    appliedGroups: string[];
    /** إذا كان للمواطن ملف موظف سابقاً، نعدّله بدل إنشائه */
    existingManaged: ManagedUser | null;
  };
  const [promoteOpen, setPromoteOpen] = useState(false);
  const [promote, setPromote] = useState<PromoteState | null>(null);
  const [promoteRolePickerKey, setPromoteRolePickerKey] = useState(0);
  const [promoteGroupPickerKey, setPromoteGroupPickerKey] = useState(0);

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

  /** خريطة publicUserId -> managed user (للعرض فقط) */
  const linkedManagedByPublicId = useMemo(() => {
    const map = new Map<string, ManagedUser>();
    users.forEach((u) => {
      if (u.linkedPublicUserId) map.set(u.linkedPublicUserId, u);
    });
    return map;
  }, [users]);

  const hasAvailableRoles = useMemo(() => rolesPickerHasMore(selectedRoles), [selectedRoles]);
  const editHasAvailableRoles = useMemo(
    () => (editForm ? rolesPickerHasMore(editForm.roles) : false),
    [editForm],
  );
  const promoteHasAvailableRoles = useMemo(
    () => (promote ? rolesPickerHasMore(promote.roles) : false),
    [promote],
  );

  const refresh = useCallback(() => {
    setUsers(loadManagedUsers());
    setPublicUsers(loadPublicUsersForAdmin());
  }, []);

  useEffect(() => {
    const onChange = () => refresh();
    window.addEventListener("ic-managed-staff", onChange as EventListener);
    return () => window.removeEventListener("ic-managed-staff", onChange as EventListener);
  }, [refresh]);

  if (!isSuperAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  const applyGroupToAdd = (gid: string) => {
    const g = groups.find((x) => x.id === gid);
    if (!g) return;
    setSelectedRoles((prev) => {
      const next = new Set(prev);
      g.roles.forEach((r) => next.add(r));
      return next;
    });
    setAppliedGroups((prev) => (prev.includes(gid) ? prev : [...prev, gid]));
    setGroupPickerKey((k) => k + 1);
    toast.success(`تم تطبيق المجموعة «${g.name}» — ${g.roles.length} رتبة`);
  };

  const removeAddGroupChip = (gid: string) => {
    const g = groups.find((x) => x.id === gid);
    setAppliedGroups((prev) => prev.filter((x) => x !== gid));
    if (!g) return;
    setSelectedRoles((prev) => {
      if (prev.size <= g.roles.length) return prev;
      const next = new Set(prev);
      g.roles.forEach((r) => next.delete(r));
      return next.size === 0 ? prev : next;
    });
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
      addManagedUser({ username: u, password, roles });
    } catch (err) {
      const quotaFull =
        err instanceof DOMException && (err.name === "QuotaExceededError" || err.code === 22);
      toast.error(
        quotaFull
          ? "تعذر حفظ قائمة الموظفين. امسح بيانات الموقع من المتصفح أو احذف محتوى كبير من التخزين المحلي."
          : "تعذر الحفظ: المتصفح قد يمنع التخزين المحلي.",
      );
      return;
    }
    refresh();
    setUsername("");
    setPassword("");
    setSelectedRoles(new Set());
    setAppliedGroups([]);
    setRolePickerKey((k) => k + 1);
    setGroupPickerKey((k) => k + 1);
    setAddOpen(false);
    const groupSummary =
      appliedGroups.length > 0
        ? ` — مجموعات: ${appliedGroups
            .map((id) => groups.find((g) => g.id === id)?.name)
            .filter(Boolean)
            .join("، ")}`
        : "";
    try {
      appendActivityLog(
        user?.username ?? "super_admin",
        "إضافة مستخدم موظف",
        `${u} — أدوار: ${roles.map(roleLabel).join("، ")}${groupSummary}`,
      );
    } catch {
      /* ignore */
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
      appendActivityLog(
        user?.username ?? "super_admin",
        isActive ? "إيقاف مستخدم موظف" : "تفعيل مستخدم موظف",
        uname,
      );
    } catch {
      /* ignore */
    }
    toast.success(isActive ? "تم إيقاف الحساب" : "تم تفعيل الحساب");
  };

  const openEdit = (u: ManagedUser) => {
    setEditForm({
      id: u.id,
      username: u.username,
      password: "",
      roles: new Set(u.roles),
      appliedGroups: [],
    });
    setEditRolePickerKey((k) => k + 1);
    setEditGroupPickerKey((k) => k + 1);
    setEditOpen(true);
  };

  const applyGroupToEdit = (gid: string) => {
    const g = groups.find((x) => x.id === gid);
    if (!g) return;
    setEditForm((prev) => {
      if (!prev) return prev;
      const nextRoles = new Set(prev.roles);
      g.roles.forEach((r) => nextRoles.add(r));
      return {
        ...prev,
        roles: nextRoles,
        appliedGroups: prev.appliedGroups.includes(gid)
          ? prev.appliedGroups
          : [...prev.appliedGroups, gid],
      };
    });
    setEditGroupPickerKey((k) => k + 1);
    toast.success(`تم تطبيق المجموعة «${g.name}»`);
  };

  const removeEditGroupChip = (gid: string) => {
    setEditForm((prev) =>
      prev ? { ...prev, appliedGroups: prev.appliedGroups.filter((x) => x !== gid) } : prev,
    );
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
          ? "تعذر الحفظ بعد محاولة تفريغ المساحة. امسح بيانات الموقع من المتصفح."
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

  const handleSavePublicEdit = (e: FormEvent) => {
    e.preventDefault();
    if (!editPublicForm) return;
    const usernameLow = editPublicForm.username.trim().toLowerCase();
    const realName = editPublicForm.realName.trim();
    const fullName = editPublicForm.fullName.trim();
    const email = editPublicForm.email.trim().toLowerCase();
    const discordId = editPublicForm.discordId.trim();
    const age = Number(editPublicForm.age);
    if (usernameLow.length < 3 || realName.length < 3 || fullName.length < 3) {
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
    if (publicUsers.some((u) => u.id !== editPublicForm.id && u.username.toLowerCase() === usernameLow)) {
      toast.error("اسم المستخدم مستخدم مسبقاً");
      return;
    }
    const next = publicUsers.map((u) =>
      u.id === editPublicForm.id
        ? {
            ...u,
            username: usernameLow,
            realName,
            fullName,
            email,
            discordId,
            age: Math.floor(age),
            password: editPublicForm.password,
            isActive: editPublicForm.isActive,
            authProvider: u.authProvider,
          }
        : u,
    );
    savePublicUsersForAdmin(next);
    refresh();
    setEditPublicOpen(false);
    setEditPublicForm(null);
    appendActivityLog(user?.username ?? "super_admin", "تعديل مستخدم عادي", `${usernameLow} — ${fullName}`);
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
    /** نزيل أيضاً أي ملف موظف مرتبط بهذا المواطن */
    const linked = findManagedUserByPublicId(target.id);
    if (linked) {
      try {
        removeManagedUser(linked.id);
      } catch {
        /* ignore */
      }
    }
    savePublicUsersForAdmin(publicUsers.filter((u) => u.id !== id));
    refresh();
    appendActivityLog(user?.username ?? "super_admin", "حذف مستخدم عادي", `${target.username} — ${target.fullName}`);
    toast.success("تم حذف المستخدم العادي");
  };

  const openPromote = (target: PublicUserRow) => {
    const linked = findManagedUserByPublicId(target.id);
    setPromote({
      publicUser: target,
      roles: new Set(linked?.roles ?? []),
      appliedGroups: [],
      existingManaged: linked,
    });
    setPromoteRolePickerKey((k) => k + 1);
    setPromoteGroupPickerKey((k) => k + 1);
    setPromoteOpen(true);
  };

  const applyGroupToPromote = (gid: string) => {
    const g = groups.find((x) => x.id === gid);
    if (!g) return;
    setPromote((prev) => {
      if (!prev) return prev;
      const nextRoles = new Set(prev.roles);
      g.roles.forEach((r) => nextRoles.add(r));
      return {
        ...prev,
        roles: nextRoles,
        appliedGroups: prev.appliedGroups.includes(gid)
          ? prev.appliedGroups
          : [...prev.appliedGroups, gid],
      };
    });
    setPromoteGroupPickerKey((k) => k + 1);
    toast.success(`تم تطبيق المجموعة «${g.name}»`);
  };

  const removePromoteGroupChip = (gid: string) => {
    setPromote((prev) =>
      prev ? { ...prev, appliedGroups: prev.appliedGroups.filter((x) => x !== gid) } : prev,
    );
  };

  const addPromoteRoleFromPicker = (value: string) => {
    const r = value as ManagedStaffRole;
    setPromote((prev) => (prev ? { ...prev, roles: new Set([...prev.roles, r]) } : prev));
    setPromoteRolePickerKey((k) => k + 1);
  };

  const removePromoteRole = (r: ManagedStaffRole) => {
    setPromote((prev) => {
      if (!prev) return prev;
      if (prev.roles.size <= 1) {
        toast.error("اختر رتبة واحدة على الأقل");
        return prev;
      }
      const next = new Set(prev.roles);
      next.delete(r);
      return { ...prev, roles: next };
    });
  };

  const handlePromoteSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!promote) return;
    const roles = Array.from(promote.roles);
    if (roles.length === 0) {
      toast.error("اختر رتبة واحدة على الأقل");
      return;
    }
    const wantedUsername = promote.publicUser.username.trim();
    const isExisting = !!promote.existingManaged;

    /** اسم مستخدم لوحة الموظف يجب ألا يتعارض مع موظف آخر */
    const conflict = loadManagedUsers().find(
      (m) => m.id !== promote.existingManaged?.id && m.username.toLowerCase() === wantedUsername.toLowerCase(),
    );
    if (conflict) {
      toast.error(`اسم «${wantedUsername}» مأخوذ بحساب موظف آخر — عدّل اسم المواطن أولاً`);
      return;
    }

    try {
      if (isExisting && promote.existingManaged) {
        const patch: Partial<Pick<ManagedUser, "username" | "password" | "roles" | "isActive">> = {
          username: wantedUsername,
          roles,
          isActive: true,
        };
        updateManagedUser(promote.existingManaged.id, patch);
      } else {
        /** كلمة المرور تترك فارغة عمداً — المواطن المرقّى يدخل عبر دسكورد/الحساب العام
         *  وتُتبنّى جلسة الموظف تلقائياً عبر PublicStaffLinkSync */
        addManagedUser({
          username: wantedUsername,
          password: "",
          roles,
          linkedPublicUserId: promote.publicUser.id,
        });
      }
    } catch (err) {
      const quotaFull =
        err instanceof DOMException && (err.name === "QuotaExceededError" || err.code === 22);
      toast.error(
        quotaFull
          ? "تعذر الحفظ. امسح بيانات الموقع أو احذف محتوى كبير."
          : "تعذر الحفظ في التخزين المحلي.",
      );
      return;
    }

    refresh();
    setPromoteOpen(false);
    const groupSummary =
      promote.appliedGroups.length > 0
        ? ` — مجموعات: ${promote.appliedGroups
            .map((id) => groups.find((g) => g.id === id)?.name)
            .filter(Boolean)
            .join("، ")}`
        : "";
    appendActivityLog(
      user?.username ?? "super_admin",
      isExisting ? "تحديث رتب موظف مرقّى" : "ترقية مواطن إلى موظف",
      `${promote.publicUser.username} — أدوار: ${roles.map(roleLabel).join("، ")}${groupSummary}`,
    );
    toast.success(
      isExisting ? "تم تحديث صلاحيات المواطن المرقّى" : "تم منح المواطن صلاحيات موظف",
    );
    setPromote(null);
  };

  const handleRevokePromotion = () => {
    if (!promote?.existingManaged) return;
    try {
      removeManagedUser(promote.existingManaged.id);
    } catch {
      toast.error("تعذر إلغاء الترقية");
      return;
    }
    refresh();
    appendActivityLog(
      user?.username ?? "super_admin",
      "إلغاء ترقية مواطن",
      `${promote.publicUser.username} — تم إلغاء كل صلاحيات الموظف`,
    );
    toast.success("تم إلغاء الترقية وإزالة كل الصلاحيات");
    setPromoteOpen(false);
    setPromote(null);
  };

  const totalManaged = users.length;
  const totalPromoted = useMemo(
    () => users.filter((u) => !!u.linkedPublicUserId).length,
    [users],
  );
  const totalCitizens = publicUsers.length;

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div className="flex flex-col-reverse gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="text-right">
          <h1 className="font-display text-2xl font-bold text-slate-900">المستخدمون والأدوار</h1>
          <p className="mt-2 text-sm text-slate-600">
            النموذج الجديد: المواطن يسجّل في الموقع بنفسه ثم يرقّيه السوبر أدمن إلى موظف بإسناد رتب
            (يدوياً أو من <Link to="/dashboard/role-groups" className="font-display text-violet-700 hover:underline">مجموعات الرتب</Link>).
          </p>
        </div>
        <div className="flex flex-wrap justify-end gap-2">
          <Button
            asChild
            type="button"
            variant="outline"
            className="border-violet-200 bg-white text-violet-700 hover:bg-violet-50"
          >
            <Link to="/dashboard/role-groups">
              <Layers className="ms-2 h-4 w-4" />
              مجموعات الرتب
            </Link>
          </Button>
          <Button
            type="button"
            className="bg-[#36164f] font-display text-white hover:bg-[#2f1344]"
            onClick={() => setAddOpen(true)}
          >
            <UserPlus className="ms-2 h-4 w-4" />
            إضافة موظف يدوياً
          </Button>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <StatCard icon={<ShieldCheck className="h-5 w-5 text-violet-600" />} label="موظفون" value={totalManaged} />
        <StatCard icon={<Crown className="h-5 w-5 text-amber-600" />} label="مرقّون من المواطنين" value={totalPromoted} />
        <StatCard icon={<Users className="h-5 w-5 text-emerald-600" />} label="مواطنون مسجّلون" value={totalCitizens} />
      </div>

      <div className="rounded-2xl border border-violet-200/80 bg-white/90 p-4 shadow-[0_14px_34px_-24px_rgba(54,22,79,0.45)]">
        <Label htmlFor="user-search" className="text-slate-700">البحث عن مستخدم</Label>
        <div className="relative mt-1.5">
          <Search className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-violet-500" />
          <Input
            id="user-search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="border-violet-200 bg-violet-50/40 pr-9 text-slate-900 placeholder:text-slate-400 focus-visible:ring-violet-400"
            placeholder="اكتب اسم المستخدم أو الإيميل للبحث..."
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
            setAppliedGroups([]);
            setRolePickerKey((k) => k + 1);
            setGroupPickerKey((k) => k + 1);
          }
        }}
      >
        <DialogContent
          dir="rtl"
          className="max-h-[min(90dvh,42rem)] overflow-y-auto border-slate-200/95 bg-white text-right shadow-[0_28px_72px_-24px_rgba(15,23,42,0.38)] sm:max-w-2xl sm:rounded-2xl"
        >
          <DialogHeader>
            <DialogTitle className="font-display text-slate-900">إضافة موظف يدوياً</DialogTitle>
            <DialogDescription className="text-slate-600">
              يمكنك تطبيق <span className="font-display text-violet-700">مجموعة رتب جاهزة</span> لإضافة كل
              رتبها دفعة واحدة، أو اختيار الرتب يدوياً.
            </DialogDescription>
          </DialogHeader>
          <form noValidate onSubmit={handleAdd} className="space-y-5">
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

            {groups.length > 0 ? (
              <div className="space-y-2 rounded-xl border border-amber-200 bg-amber-50/40 p-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="grp-pick-add" className="text-amber-900">
                    تطبيق مجموعة جاهزة (يضيف كل رتب المجموعة)
                  </Label>
                  <Layers className="h-4 w-4 text-amber-600" />
                </div>
                <Select
                  key={`grp-add-${groupPickerKey}`}
                  onValueChange={(v) => v && applyGroupToAdd(v)}
                >
                  <SelectTrigger
                    id="grp-pick-add"
                    type="button"
                    className="border-amber-300 bg-white text-right [&>span]:text-right"
                    dir="rtl"
                  >
                    <SelectValue placeholder="اختر مجموعة لإضافة كل رتبها" />
                  </SelectTrigger>
                  <SelectContent dir="rtl" className="max-h-72 border-amber-200 bg-white">
                    {groups.map((g) => (
                      <SelectItem
                        key={g.id}
                        value={g.id}
                        className="text-right text-slate-800 focus:bg-amber-50 focus:text-amber-900"
                      >
                        {g.name} <span className="text-[10px] text-slate-500">({g.roles.length} رتبة)</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {appliedGroups.length > 0 ? (
                  <div className="flex flex-wrap justify-end gap-1.5">
                    {appliedGroups.map((gid) => {
                      const g = groups.find((x) => x.id === gid);
                      if (!g) return null;
                      return (
                        <span
                          key={gid}
                          className="inline-flex items-center gap-1 rounded-full border border-amber-300 bg-white px-2.5 py-0.5 text-[11px] font-display text-amber-800"
                        >
                          <Layers className="h-3 w-3" />
                          {g.name}
                          <button
                            type="button"
                            onClick={() => removeAddGroupChip(gid)}
                            className="rounded-full p-0.5 text-amber-700 hover:bg-amber-100"
                            aria-label={`إزالة شارة ${g.name}`}
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </span>
                      );
                    })}
                  </div>
                ) : null}
              </div>
            ) : (
              <p className="rounded-lg border border-amber-200 bg-amber-50/40 p-2 text-[11px] text-amber-800">
                نصيحة: أنشئ <Link to="/dashboard/role-groups" className="underline">مجموعات رتب</Link> لاستخدامها مرات متعددة بنقرة واحدة.
              </p>
            )}

            <div className="space-y-3">
              <Label htmlFor="role-picker" className="text-slate-700">إضافة رتبة فردية</Label>
              <Select
                key={rolePickerKey}
                disabled={!hasAvailableRoles}
                onValueChange={(v) => v && addRoleFromPicker(v)}
              >
                <SelectTrigger
                  id="role-picker"
                  type="button"
                  className="border-violet-200 bg-violet-50/40 text-right [&>span]:text-right [&>span]:text-slate-700"
                  dir="rtl"
                >
                  <SelectValue
                    placeholder={hasAvailableRoles ? "اختر رتبة لإضافتها" : "تم اختيار كل الرتب"}
                  />
                </SelectTrigger>
                <SelectContent dir="rtl" className="max-h-[min(70vh,24rem)] border-violet-200 bg-white">
                  {BASE_ROLES.some((b) => !selectedRoles.has(b.value)) ? (
                    <SelectGroup>
                      <SelectLabel className="text-right text-slate-500">رتب عامة</SelectLabel>
                      {BASE_ROLES.filter((b) => !selectedRoles.has(b.value)).map((b) => (
                        <SelectItem
                          key={b.value}
                          value={b.value}
                          className="text-right text-slate-800 focus:bg-violet-50 focus:text-violet-900"
                        >
                          {b.label}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  ) : null}
                  {INSTITUTION_ROSTER_STAFF_ROLES.some((r) => !selectedRoles.has(r)) ? (
                    <SelectGroup>
                      <SelectLabel className="text-right text-slate-500">طواقم المؤسسات</SelectLabel>
                      {INSTITUTION_ROSTER_STAFF_ROLES.filter((r) => !selectedRoles.has(r)).map((r) => (
                        <SelectItem
                          key={r}
                          value={r}
                          className="text-right text-slate-800 focus:bg-violet-50 focus:text-violet-900"
                        >
                          {institutionRosterStaffRoleLabelAr(r)}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  ) : null}
                </SelectContent>
              </Select>

              <div>
                <p className="mb-2 text-xs font-medium text-slate-500">الرتب المختارة</p>
                <div className="flex min-h-[2.5rem] flex-wrap justify-end gap-2 rounded-xl border border-violet-200 bg-violet-50/55 p-3">
                  {Array.from(selectedRoles).length === 0 ? (
                    <p className="text-xs text-slate-500">لم تُضف رتب بعد</p>
                  ) : null}
                  {Array.from(selectedRoles).map((r) => (
                    <span
                      key={r}
                      className="inline-flex max-w-full items-center gap-1.5 rounded-full border border-violet-300 bg-white px-3 py-1 text-xs font-medium text-violet-900 shadow-sm"
                    >
                      <span className="truncate">{roleLabel(r)}</span>
                      <button
                        type="button"
                        className="shrink-0 rounded-full p-0.5 text-violet-700 hover:bg-violet-200/80"
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
                إضافة الموظف
              </Button>
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
          className="max-h-[min(90dvh,42rem)] overflow-y-auto border-slate-200/95 bg-white text-right shadow-[0_28px_72px_-24px_rgba(15,23,42,0.38)] sm:max-w-2xl sm:rounded-2xl"
        >
          <DialogHeader>
            <DialogTitle className="font-display text-slate-900">تعديل موظف</DialogTitle>
            <DialogDescription className="text-slate-600">
              غيّر اسم المستخدم والرتب؛ اترك كلمة المرور فارغة للإبقاء على الحالية. يمكنك تطبيق مجموعة لإضافة عدة رتب.
            </DialogDescription>
          </DialogHeader>
          {editForm ? (
            <form onSubmit={handleEditSave} className="space-y-4" noValidate>
              <div className="grid gap-3 sm:grid-cols-2">
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
              </div>

              {groups.length > 0 ? (
                <div className="space-y-2 rounded-xl border border-amber-200 bg-amber-50/40 p-3">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="grp-pick-edit" className="text-amber-900">
                      تطبيق مجموعة جاهزة
                    </Label>
                    <Layers className="h-4 w-4 text-amber-600" />
                  </div>
                  <Select
                    key={`grp-edit-${editGroupPickerKey}`}
                    onValueChange={(v) => v && applyGroupToEdit(v)}
                  >
                    <SelectTrigger
                      id="grp-pick-edit"
                      type="button"
                      className="border-amber-300 bg-white text-right [&>span]:text-right"
                      dir="rtl"
                    >
                      <SelectValue placeholder="اختر مجموعة لإضافة رتبها" />
                    </SelectTrigger>
                    <SelectContent dir="rtl" className="max-h-72 border-amber-200 bg-white">
                      {groups.map((g) => (
                        <SelectItem
                          key={g.id}
                          value={g.id}
                          className="text-right text-slate-800 focus:bg-amber-50 focus:text-amber-900"
                        >
                          {g.name} <span className="text-[10px] text-slate-500">({g.roles.length} رتبة)</span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {editForm.appliedGroups.length > 0 ? (
                    <div className="flex flex-wrap justify-end gap-1.5">
                      {editForm.appliedGroups.map((gid) => {
                        const g = groups.find((x) => x.id === gid);
                        if (!g) return null;
                        return (
                          <span
                            key={gid}
                            className="inline-flex items-center gap-1 rounded-full border border-amber-300 bg-white px-2.5 py-0.5 text-[11px] font-display text-amber-800"
                          >
                            <Layers className="h-3 w-3" />
                            {g.name}
                            <button
                              type="button"
                              onClick={() => removeEditGroupChip(gid)}
                              className="rounded-full p-0.5 text-amber-700 hover:bg-amber-100"
                              aria-label={`إزالة شارة ${g.name}`}
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </span>
                        );
                      })}
                    </div>
                  ) : null}
                </div>
              ) : null}

              <div className="space-y-3">
                <Label htmlFor="edit-role-picker" className="text-slate-700">إضافة رتبة فردية</Label>
                <Select
                  key={editRolePickerKey}
                  disabled={!editHasAvailableRoles}
                  onValueChange={(v) => v && addEditRoleFromPicker(v)}
                >
                  <SelectTrigger
                    id="edit-role-picker"
                    type="button"
                    className="border-violet-200 bg-violet-50/40 text-right [&>span]:text-right [&>span]:text-slate-700"
                    dir="rtl"
                  >
                    <SelectValue
                      placeholder={editHasAvailableRoles ? "اختر رتبة لإضافتها" : "تم اختيار كل الرتب"}
                    />
                  </SelectTrigger>
                  <SelectContent dir="rtl" className="max-h-[min(70vh,24rem)] border-violet-200 bg-white">
                    {BASE_ROLES.some((b) => !editForm.roles.has(b.value)) ? (
                      <SelectGroup>
                        <SelectLabel className="text-right text-slate-500">رتب عامة</SelectLabel>
                        {BASE_ROLES.filter((b) => !editForm.roles.has(b.value)).map((b) => (
                          <SelectItem
                            key={b.value}
                            value={b.value}
                            className="text-right text-slate-800 focus:bg-violet-50 focus:text-violet-900"
                          >
                            {b.label}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    ) : null}
                    {INSTITUTION_ROSTER_STAFF_ROLES.some((r) => !editForm.roles.has(r)) ? (
                      <SelectGroup>
                        <SelectLabel className="text-right text-slate-500">طواقم المؤسسات</SelectLabel>
                        {INSTITUTION_ROSTER_STAFF_ROLES.filter((r) => !editForm.roles.has(r)).map((r) => (
                          <SelectItem
                            key={r}
                            value={r}
                            className="text-right text-slate-800 focus:bg-violet-50 focus:text-violet-900"
                          >
                            {institutionRosterStaffRoleLabelAr(r)}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    ) : null}
                  </SelectContent>
                </Select>
                <div>
                  <p className="mb-2 text-xs font-medium text-slate-500">الرتب المختارة</p>
                  <div className="flex min-h-[2.5rem] flex-wrap justify-end gap-2 rounded-xl border border-violet-200 bg-violet-50/55 p-3">
                    {Array.from(editForm.roles).map((r) => (
                      <span
                        key={r}
                        className="inline-flex max-w-full items-center gap-1.5 rounded-full border border-violet-300 bg-white px-3 py-1 text-xs font-medium text-violet-900 shadow-sm"
                      >
                        <span className="truncate">{roleLabel(r)}</span>
                        <button
                          type="button"
                          className="shrink-0 rounded-full p-0.5 text-violet-700 hover:bg-violet-200/80"
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
        <div className="flex items-center justify-between border-b border-violet-100 px-4 py-3 text-right font-display text-sm font-semibold text-slate-800">
          <span className="rounded-full bg-violet-100 px-2 py-0.5 text-[10px] font-display text-violet-700">
            {list.length}
          </span>
          <span className="flex items-center gap-2">
            الموظفون
            <ShieldCheck className="h-4 w-4 text-violet-600" />
          </span>
        </div>
        <ul className="divide-y divide-violet-100">
          {list.length === 0 ? (
            <li className="px-4 py-8 text-center text-sm text-slate-500">
              {searchQuery.trim() ? "لا توجد نتائج مطابقة للبحث." : "لا يوجد موظفون بعد."}
            </li>
          ) : (
            list.map((u) => {
              const isPromoted = !!u.linkedPublicUserId;
              return (
                <li
                  key={u.id}
                  className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 text-right"
                >
                  <div className="min-w-0 flex-1">
                    <p className="flex flex-wrap items-center gap-2 font-medium text-slate-900">
                      {u.username}
                      <span className={cn(
                        "inline-flex rounded-full px-2 py-0.5 text-[11px]",
                        u.isActive === false ? "bg-rose-50 text-rose-700" : "bg-emerald-50 text-emerald-700",
                      )}>
                        {u.isActive === false ? "موقوف" : "نشط"}
                      </span>
                      {isPromoted ? (
                        <span className="inline-flex items-center gap-1 rounded-full border border-amber-300 bg-amber-50 px-2 py-0.5 text-[10px] font-display text-amber-800">
                          <Crown className="h-3 w-3" />
                          مواطن مرقّى
                        </span>
                      ) : null}
                    </p>
                    <p className="mt-0.5 text-xs text-slate-600">
                      {u.roles.map((role) => roleLabel(role)).join(" · ")}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="border-violet-200 bg-white text-violet-700 hover:bg-violet-50"
                      onClick={() => openEdit(u)}
                    >
                      <Pencil className="h-4 w-4 ms-1" />
                      تعديل
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className={cn(
                        "border",
                        u.isActive === false
                          ? "border-emerald-300 bg-emerald-50 text-emerald-800 hover:bg-emerald-100"
                          : "border-amber-300 bg-amber-50 text-amber-800 hover:bg-amber-100",
                      )}
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
              );
            })
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
        <DialogContent
          dir="rtl"
          className="max-h-[min(90dvh,40rem)] overflow-y-auto border-slate-200/95 bg-white text-right shadow-[0_28px_72px_-24px_rgba(15,23,42,0.38)] sm:max-w-lg sm:rounded-2xl"
        >
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

      <Dialog
        open={promoteOpen}
        onOpenChange={(open) => {
          setPromoteOpen(open);
          if (!open) setPromote(null);
        }}
      >
        <DialogContent
          dir="rtl"
          className="max-h-[min(92dvh,46rem)] overflow-y-auto border-slate-200/95 bg-white text-right shadow-[0_28px_72px_-24px_rgba(15,23,42,0.38)] sm:max-w-2xl sm:rounded-2xl"
        >
          <DialogHeader>
            <DialogTitle className="flex items-center justify-end gap-2 font-display text-slate-900">
              <Crown className="h-5 w-5 text-amber-600" />
              {promote?.existingManaged ? "تحديث صلاحيات مواطن مرقّى" : "ترقية مواطن إلى موظف"}
            </DialogTitle>
            <DialogDescription className="text-slate-600">
              اختَر الرتب فقط — لا داعي لكلمة مرور. سيدخل المواطن عبر دسكورد كالعادة وستظهر له لوحة التحكم تلقائياً في بروفايله بالصلاحيات المختارة.
            </DialogDescription>
          </DialogHeader>
          {promote ? (
            <form onSubmit={handlePromoteSubmit} className="space-y-5" noValidate>
              <div className="rounded-xl border border-amber-200 bg-gradient-to-l from-amber-50 via-white to-amber-50 p-4">
                <p className="font-display text-base font-bold text-slate-900">{promote.publicUser.fullName}</p>
                <p className="mt-1 text-xs text-slate-600">
                  اسم الحساب: <span className="font-mono text-slate-800">{promote.publicUser.username}</span>
                </p>
                <p className="text-xs text-slate-600">
                  الإيميل: <span dir="ltr" className="font-mono">{promote.publicUser.email}</span>
                </p>
                {promote.publicUser.discordId && promote.publicUser.discordId !== "—" ? (
                  <p className="text-xs text-slate-600">
                    Discord: <span dir="ltr" className="font-mono">{promote.publicUser.discordId}</span>
                  </p>
                ) : null}
                {promote.existingManaged ? (
                  <p className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-amber-300 bg-amber-50 px-2 py-0.5 text-[11px] font-display text-amber-900">
                    <ShieldCheck className="h-3 w-3" />
                    له ملف موظف بالفعل — التحديث يحلّ محل صلاحياته الحالية
                  </p>
                ) : null}
              </div>

              <div className="rounded-xl border border-emerald-300/80 bg-emerald-50/70 p-3 text-right">
                <div className="flex items-center justify-end gap-2 text-emerald-900">
                  <ShieldCheck className="h-4 w-4 text-emerald-700" />
                  <p className="font-display text-sm font-bold">لا حاجة لكلمة مرور</p>
                </div>
                <p className="mt-1.5 text-xs leading-relaxed text-emerald-900/85">
                  المواطن يسجّل الدخول كالعادة عبر <span className="font-display font-semibold">دسكورد</span> أو حسابه العام،
                  وعند دخوله ستظهر له <span className="font-display font-semibold">لوحة التحكم</span> تلقائياً في صفحة بروفايله
                  بصلاحيات الرتب التي تعطيها له هنا.
                </p>
              </div>

              {groups.length > 0 ? (
                <div className="space-y-2 rounded-xl border border-amber-200 bg-amber-50/40 p-3">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="grp-pick-promote" className="text-amber-900">
                      تطبيق مجموعة جاهزة (يضيف كل رتبها)
                    </Label>
                    <Layers className="h-4 w-4 text-amber-600" />
                  </div>
                  <Select
                    key={`grp-promote-${promoteGroupPickerKey}`}
                    onValueChange={(v) => v && applyGroupToPromote(v)}
                  >
                    <SelectTrigger
                      id="grp-pick-promote"
                      type="button"
                      className="border-amber-300 bg-white text-right [&>span]:text-right"
                      dir="rtl"
                    >
                      <SelectValue placeholder="اختر مجموعة لإضافة كل رتبها" />
                    </SelectTrigger>
                    <SelectContent dir="rtl" className="max-h-72 border-amber-200 bg-white">
                      {groups.map((g) => (
                        <SelectItem
                          key={g.id}
                          value={g.id}
                          className="text-right text-slate-800 focus:bg-amber-50 focus:text-amber-900"
                        >
                          {g.name} <span className="text-[10px] text-slate-500">({g.roles.length} رتبة)</span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {promote.appliedGroups.length > 0 ? (
                    <div className="flex flex-wrap justify-end gap-1.5">
                      {promote.appliedGroups.map((gid) => {
                        const g = groups.find((x) => x.id === gid);
                        if (!g) return null;
                        return (
                          <span
                            key={gid}
                            className="inline-flex items-center gap-1 rounded-full border border-amber-300 bg-white px-2.5 py-0.5 text-[11px] font-display text-amber-800"
                          >
                            <Layers className="h-3 w-3" />
                            {g.name}
                            <button
                              type="button"
                              onClick={() => removePromoteGroupChip(gid)}
                              className="rounded-full p-0.5 text-amber-700 hover:bg-amber-100"
                              aria-label={`إزالة شارة ${g.name}`}
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </span>
                        );
                      })}
                    </div>
                  ) : null}
                </div>
              ) : (
                <p className="rounded-lg border border-amber-200 bg-amber-50/40 p-2 text-[11px] text-amber-800">
                  نصيحة: أنشئ <Link to="/dashboard/role-groups" className="underline">مجموعات رتب</Link> لاستخدامها بنقرة واحدة.
                </p>
              )}

              <div className="space-y-3">
                <Label htmlFor="promote-role-picker" className="text-slate-700">إضافة رتبة فردية</Label>
                <Select
                  key={promoteRolePickerKey}
                  disabled={!promoteHasAvailableRoles}
                  onValueChange={(v) => v && addPromoteRoleFromPicker(v)}
                >
                  <SelectTrigger
                    id="promote-role-picker"
                    type="button"
                    className="border-violet-200 bg-violet-50/40 text-right [&>span]:text-right [&>span]:text-slate-700"
                    dir="rtl"
                  >
                    <SelectValue
                      placeholder={promoteHasAvailableRoles ? "اختر رتبة لإضافتها" : "تم اختيار كل الرتب"}
                    />
                  </SelectTrigger>
                  <SelectContent dir="rtl" className="max-h-[min(70vh,24rem)] border-violet-200 bg-white">
                    {BASE_ROLES.some((b) => !promote.roles.has(b.value)) ? (
                      <SelectGroup>
                        <SelectLabel className="text-right text-slate-500">رتب عامة</SelectLabel>
                        {BASE_ROLES.filter((b) => !promote.roles.has(b.value)).map((b) => (
                          <SelectItem
                            key={b.value}
                            value={b.value}
                            className="text-right text-slate-800 focus:bg-violet-50 focus:text-violet-900"
                          >
                            {b.label}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    ) : null}
                    {INSTITUTION_ROSTER_STAFF_ROLES.some((r) => !promote.roles.has(r)) ? (
                      <SelectGroup>
                        <SelectLabel className="text-right text-slate-500">طواقم المؤسسات</SelectLabel>
                        {INSTITUTION_ROSTER_STAFF_ROLES.filter((r) => !promote.roles.has(r)).map((r) => (
                          <SelectItem
                            key={r}
                            value={r}
                            className="text-right text-slate-800 focus:bg-violet-50 focus:text-violet-900"
                          >
                            {institutionRosterStaffRoleLabelAr(r)}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    ) : null}
                  </SelectContent>
                </Select>
                <div>
                  <p className="mb-2 text-xs font-medium text-slate-500">الرتب التي ستُمنح للمواطن</p>
                  <div className="flex min-h-[2.5rem] flex-wrap justify-end gap-2 rounded-xl border border-violet-200 bg-violet-50/55 p-3">
                    {Array.from(promote.roles).length === 0 ? (
                      <p className="text-xs text-slate-500">لم تُضف رتب بعد</p>
                    ) : null}
                    {Array.from(promote.roles).map((r) => (
                      <span
                        key={r}
                        className="inline-flex max-w-full items-center gap-1.5 rounded-full border border-violet-300 bg-white px-3 py-1 text-xs font-medium text-violet-900 shadow-sm"
                      >
                        <span className="truncate">{roleLabel(r)}</span>
                        <button
                          type="button"
                          className="shrink-0 rounded-full p-0.5 text-violet-700 hover:bg-violet-200/80"
                          aria-label={`إزالة ${roleLabel(r)}`}
                          onClick={() => removePromoteRole(r)}
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <DialogFooter className="flex-col-reverse gap-2 sm:flex-row sm:justify-between">
                {promote.existingManaged ? (
                  <Button
                    type="button"
                    variant="outline"
                    className="border-rose-300 bg-rose-50 text-rose-800 hover:bg-rose-100"
                    onClick={handleRevokePromotion}
                  >
                    <Trash2 className="ms-2 h-4 w-4" />
                    إلغاء كل الصلاحيات
                  </Button>
                ) : (
                  <span />
                )}
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="border-violet-200 bg-white text-violet-700 hover:bg-violet-50"
                    onClick={() => setPromoteOpen(false)}
                  >
                    إلغاء
                  </Button>
                  <Button type="submit" className="bg-[#36164f] text-white hover:bg-[#2f1344]">
                    <Crown className="ms-2 h-4 w-4" />
                    {promote.existingManaged ? "تحديث الصلاحيات" : "منح صلاحيات الموظف"}
                  </Button>
                </div>
              </DialogFooter>
            </form>
          ) : null}
        </DialogContent>
      </Dialog>

      <div className="overflow-hidden rounded-2xl border border-violet-200/80 bg-white/95 shadow-[0_18px_44px_-28px_rgba(54,22,79,0.45)]">
        <div className="flex items-center justify-between border-b border-violet-100 px-4 py-3 text-right font-display text-sm font-semibold text-slate-800">
          <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-display text-emerald-700">
            {publicList.length}
          </span>
          <span className="flex items-center gap-2">
            المواطنون (مسجّلون ذاتياً)
            <Users className="h-4 w-4 text-emerald-600" />
          </span>
        </div>
        <ul className="divide-y divide-violet-100">
          {publicList.length === 0 ? (
            <li className="px-4 py-8 text-center text-sm text-slate-500">
              {searchQuery.trim() ? "لا توجد نتائج مطابقة للبحث." : "لا يوجد مواطنون مسجّلون بعد."}
            </li>
          ) : (
            publicList.map((u) => {
              const linked = linkedManagedByPublicId.get(u.id);
              return (
                <li key={u.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 text-right">
                  <div className="min-w-0 flex-1">
                    <p className="flex flex-wrap items-center gap-2 font-medium text-slate-900">
                      {u.username}
                      <span className={cn(
                        "inline-flex rounded-full px-2 py-0.5 text-[11px]",
                        u.isActive ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700",
                      )}>
                        {u.isActive ? "نشط" : "موقوف"}
                      </span>
                      {linked ? (
                        <span className="inline-flex items-center gap-1 rounded-full border border-amber-300 bg-amber-50 px-2 py-0.5 text-[10px] font-display text-amber-800">
                          <Crown className="h-3 w-3" />
                          مرقّى — {linked.roles.length} رتبة
                        </span>
                      ) : null}
                    </p>
                    <p className="text-xs text-slate-600">
                      داخل المدينة: {u.fullName} · الحقيقي: {u.realName}
                    </p>
                    <p className="text-xs text-slate-500">{u.email}</p>
                    {linked ? (
                      <p className="mt-1 text-[11px] text-amber-800">
                        صلاحيات: {linked.roles.map(roleLabel).join(" · ")}
                      </p>
                    ) : null}
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs text-slate-500">
                      {u.createdAt ? new Date(u.createdAt).toLocaleString("ar") : "—"}
                    </span>
                    <Button
                      type="button"
                      size="sm"
                      className={cn(
                        "font-display",
                        linked
                          ? "bg-amber-600 text-white hover:bg-amber-700"
                          : "bg-gradient-to-l from-amber-500 to-orange-600 text-white hover:from-amber-600 hover:to-orange-700",
                      )}
                      onClick={() => openPromote(u)}
                    >
                      {linked ? (
                        <>
                          <UserCog className="h-4 w-4 ms-1" />
                          تعديل الصلاحيات
                        </>
                      ) : (
                        <>
                          <Crown className="h-4 w-4 ms-1" />
                          ترقية إلى موظف
                        </>
                      )}
                    </Button>
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
              );
            })
          )}
        </ul>
      </div>
    </div>
  );
};

export default StaffUsersPage;

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl border border-violet-200 bg-white px-4 py-3 text-right shadow-sm">
      <div className="rounded-xl bg-violet-50 p-2">{icon}</div>
      <div>
        <p className="text-[11px] font-medium text-slate-500">{label}</p>
        <p className="font-display text-2xl font-bold text-slate-900">{value}</p>
      </div>
    </div>
  );
}

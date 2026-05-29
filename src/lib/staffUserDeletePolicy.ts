import { SUPER_ADMIN_USERNAME } from "@/config/staffAuth";
import { isOwnerUsername } from "@/config/ownerAuth";
import type { StaffUser } from "@/contexts/AuthContext";
import type { ManagedUser } from "@/staff/staffDirectory";

export const SUPER_ADMIN_DELETE_ONLY_MESSAGE =
  "حذف المستخدمين والأدمن متاح لمسؤول النظام (سوبر أدمن) فقط.";

export function isSuperAdminActor(actor: StaffUser | null | undefined): boolean {
  return !!actor?.isOwner || !!actor?.roles.includes("super_admin");
}

export function assertSuperAdminCanDeleteUsers(actor: StaffUser | null | undefined): boolean {
  return isSuperAdminActor(actor);
}

export function canDeleteManagedStaffTarget(target: Pick<ManagedUser, "username">): {
  ok: boolean;
  message?: string;
} {
  if (target.username.trim().toLowerCase() === SUPER_ADMIN_USERNAME.toLowerCase()) {
    return { ok: false, message: "لا يمكن حذف حساب السوبر أدمن." };
  }
  if (isOwnerUsername(target.username)) {
    return { ok: false, message: "لا يمكن حذف هذا الحساب." };
  }
  return { ok: true };
}

import { isOwnerUsername } from "@/config/ownerAuth";

const STAFF_SESSION_KEY = "ic_staff_session";

export type StaffAuditUser = {
  username?: string;
  isOwner?: boolean;
};

/** هل جلسة المالك المخفي نشطة في هذا التبويب؟ */
export function isOwnerSessionActive(): boolean {
  try {
    const raw = sessionStorage.getItem(STAFF_SESSION_KEY);
    if (!raw) return false;
    const parsed = JSON.parse(raw) as { isOwner?: unknown; username?: unknown };
    return parsed.isOwner === true || isOwnerUsername(String(parsed.username ?? ""));
  } catch {
    return false;
  }
}

/**
 * اسم يُحفظ في الطلبات/التكتات/القرارات — المالك لا يُذكر أبداً (يظهر كـ fallback).
 */
export function staffAuditActorName(
  user: StaffAuditUser | null | undefined,
  fallback = "super_admin",
): string {
  if (!user || user.isOwner || isOwnerUsername(user.username)) return fallback;
  return (user.username ?? "").trim() || fallback;
}

/** إخفاء «owner» من الواجهات حتى لو وُجد في بيانات قديمة */
export function sanitizeAuditDisplayName(
  name: string | undefined | null,
  fallback = "super_admin",
): string {
  if (!name?.trim() || isOwnerUsername(name)) return fallback;
  return name.trim();
}

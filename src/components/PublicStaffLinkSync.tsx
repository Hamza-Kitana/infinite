import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { usePublicUser } from "@/contexts/PublicUserContext";
import {
  findManagedUserByPublicId,
  loadManagedUsers,
  IC_MANAGED_STAFF_CHANGED_EVENT,
  IC_MANAGED_STAFF_STORAGE_KEY,
} from "@/staff/staffDirectory";

/**
 * يجسر بين جلسة المواطن (Public) وجلسة الموظف (Staff) للمواطنين المرقَّين.
 *
 * - عندما يسجّل مواطن مرقّى الدخول كحساب عام → يُنشئ تلقائياً جلسة موظف بنفس الأدوار.
 * - عند خروج المواطن → تُلغى جلسة الموظف إن كانت مرتبطة بحسابه (وليست من «Lock» منفصلة).
 * - عند تغيير المواطن (شخص آخر سجّل) → تتبدّل الجلسات بشكل صحيح.
 *
 * هذا المكوّن لا يصيّر شيئاً — مجرد منطق side-effect.
 */
export function PublicStaffLinkSync() {
  const publicUser = usePublicUser();
  const auth = useAuth();
  const publicId = publicUser.user?.id ?? null;
  const staffManagedId = auth.user?.managedId ?? null;
  const [managedListEpoch, setManagedListEpoch] = useState(0);

  useEffect(() => {
    const bump = () => setManagedListEpoch((n) => n + 1);
    window.addEventListener(IC_MANAGED_STAFF_CHANGED_EVENT, bump);
    const onStorage = (e: StorageEvent) => {
      if (e.key === IC_MANAGED_STAFF_STORAGE_KEY) bump();
    };
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener(IC_MANAGED_STAFF_CHANGED_EVENT, bump);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  useEffect(() => {
    if (auth.user?.isOwner) return;
    if (publicId) {
      const linkedManaged = findManagedUserByPublicId(publicId);

      if (auth.user) {
        if (auth.user.managedId) {
          const current = loadManagedUsers().find((m) => m.id === auth.user!.managedId);
          if (current?.linkedPublicUserId && current.linkedPublicUserId !== publicId) {
            auth.logout();
            if (linkedManaged) auth.adoptLinkedStaffSession(publicId);
          }
        }
        return;
      }

      if (linkedManaged) {
        auth.adoptLinkedStaffSession(publicId);
      }
      return;
    }

    if (staffManagedId) {
      const m = loadManagedUsers().find((x) => x.id === staffManagedId);
      if (m?.linkedPublicUserId) {
        auth.logout();
      }
    }
  }, [publicId, staffManagedId, auth, managedListEpoch]);

  return null;
}

export default PublicStaffLinkSync;

import { toast } from "sonner";

const timers = new Map<string, ReturnType<typeof setTimeout>>();

/**
 * بعد توقف التعديلات لمدة delayMs يظهر toast نجاح مرة واحدة.
 * يُستخدم مع الحفظ التلقائي في localStorage حتى لا يُزعج المستخدم كل حرف.
 */
export function schedulePersistSuccessToast(message: string, toastId: string, delayMs = 750) {
  const prev = timers.get(toastId);
  if (prev !== undefined) window.clearTimeout(prev);
  const t = window.setTimeout(() => {
    timers.delete(toastId);
    toast.success(message, { id: toastId, duration: 2600 });
  }, delayMs);
  timers.set(toastId, t);
}

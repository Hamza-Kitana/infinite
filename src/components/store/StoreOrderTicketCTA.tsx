import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { ShoppingBag } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useApplicationsContent } from "@/contexts/ApplicationsContentContext";
import { usePublicUser } from "@/contexts/PublicUserContext";
import { createStoreOrderTicket } from "@/lib/storeOrderTicket";
import { isPublicTicketsUnlocked, MSG_TICKETS_NEED_CITY_PROFILE } from "@/lib/publicProfileEligibility";
import { MSG_TICKET_CREATED_WAIT_FOR_STAFF } from "@/lib/ticketsCenter";
import { cn } from "@/lib/utils";

const btnClass =
  "inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-gradient-neon px-5 font-display text-sm font-semibold text-primary-foreground shadow-[0_0_20px_hsl(var(--primary)/0.3)] transition hover:opacity-95 sm:h-10 sm:min-w-[10.5rem]";

type StoreOrderTicketCTAProps = {
  taken?: boolean;
  disabled?: boolean;
  buttonLabel: string;
  /** يُعرض في نافذة التأكيد تحت الشرح */
  confirmSummary: string;
  subject: string;
  productDetailsBody: string;
  onAfterSubmit?: () => void;
};

export function StoreOrderTicketCTA({
  taken,
  disabled,
  buttonLabel,
  confirmSummary,
  subject,
  productDetailsBody,
  onAfterSubmit,
}: StoreOrderTicketCTAProps) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const navigate = useNavigate();
  const { user, getProfile } = usePublicUser();
  const profile = getProfile();
  const { applications } = useApplicationsContent();

  const blocked = !!(taken || disabled);

  const startConfirm = () => {
    if (blocked) return;
    if (!user) {
      toast.message("سجّل الدخول أولاً لتقديم طلب من المتجر.");
      navigate("/profile");
      return;
    }
    if (!profile) {
      toast.message("أكمل بيانات حسابك من البروفايل.");
      navigate("/profile");
      return;
    }
    if (!isPublicTicketsUnlocked(profile, applications)) {
      toast.message(MSG_TICKETS_NEED_CITY_PROFILE);
      navigate("/profile");
      return;
    }
    setConfirmOpen(true);
  };

  const submit = () => {
    if (!user || !profile) return;
    try {
      const t = createStoreOrderTicket({
        user,
        profile,
        subject,
        productDetailsBody,
      });
      setConfirmOpen(false);
      onAfterSubmit?.();
      toast.success("تم إنشاء طلب المتجر", {
        description: MSG_TICKET_CREATED_WAIT_FOR_STAFF,
        duration: 9000,
      });
      navigate(`/tickets?focus=${encodeURIComponent(t.id)}`);
    } catch {
      toast.error("تعذر حفظ الطلب. حاول مرة أخرى.");
    }
  };

  return (
    <>
      <button
        type="button"
        disabled={blocked}
        onClick={startConfirm}
        className={cn(btnClass, blocked && "pointer-events-none opacity-50")}
      >
        <ShoppingBag className="h-4 w-4 shrink-0" aria-hidden />
        {buttonLabel}
      </button>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent dir="rtl" className="text-right sm:rounded-xl">
          <AlertDialogHeader>
            <AlertDialogTitle>تأكيد طلب من المتجر؟</AlertDialogTitle>
            <AlertDialogDescription className="space-y-2 text-right text-muted-foreground">
              <p>
                سيتم إنشاء تكت «طلب متجر» يتضمّن تفاصيل هذا العنصر وبيانات حسابك — متابعة الطلب والدفع يكون مع فريق
                المتجر داخل التكت.
              </p>
              {confirmSummary.trim() ? <p className="font-medium text-foreground">{confirmSummary.trim()}</p> : null}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2 sm:flex-row-reverse sm:justify-start">
            <AlertDialogAction type="button" onClick={submit}>
              تأكيد الطلب
            </AlertDialogAction>
            <AlertDialogCancel type="button">إلغاء</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

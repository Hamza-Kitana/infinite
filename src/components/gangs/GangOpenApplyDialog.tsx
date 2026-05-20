import { useCallback, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Crown, MessageSquareMore, Send } from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea";
import { TicketAttachmentPicker } from "@/components/tickets/TicketAttachmentPicker";
import { usePublicUser } from "@/contexts/PublicUserContext";
import { useApplicationsContent } from "@/contexts/ApplicationsContentContext";
import { createGangOpenTicket, findOpenGangOpenTicket } from "@/lib/gangOpenTicket";
import {
  isPostCitizenApplyUnlocked,
  MSG_POST_CITIZEN_APPROVED_NEEDED,
} from "@/lib/publicProfileEligibility";
import { MSG_TICKET_CREATED_WAIT_FOR_STAFF, useTicketsCenter, type TicketAttachment } from "@/lib/ticketsCenter";
import { revokePendingTicketAttachment } from "@/lib/ticketAttachmentRead";

type GangOpenApplyDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function GangOpenApplyDialog({ open, onOpenChange }: GangOpenApplyDialogProps) {
  const { user, getProfile } = usePublicUser();
  const { applications } = useApplicationsContent();
  const tickets = useTicketsCenter();
  const profile = useMemo(() => (user ? getProfile() : null), [user, getProfile]);
  const unlocked = isPostCitizenApplyUnlocked(profile, applications);

  const [proposedName, setProposedName] = useState("");
  const [specialty, setSpecialty] = useState("");
  const [location, setLocation] = useState("");
  const [body, setBody] = useState("");
  const [attachment, setAttachment] = useState<TicketAttachment | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const existingOpen = useMemo(() => {
    if (!user) return undefined;
    return findOpenGangOpenTicket(tickets, user.id);
  }, [tickets, user]);

  const resetForm = useCallback(() => {
    setProposedName("");
    setSpecialty("");
    setLocation("");
    setBody("");
    setAttachment((prev) => {
      void revokePendingTicketAttachment(prev);
      return null;
    });
  }, []);

  const submit = () => {
    if (!user) return;
    if (!unlocked) {
      toast.message(MSG_POST_CITIZEN_APPROVED_NEEDED);
      return;
    }
    if (existingOpen) {
      toast.message("لديك طلب فتح عصابة قيد المتابعة — تابعه من التكتات.");
      onOpenChange(false);
      return;
    }
    const name = proposedName.trim();
    const spec = specialty.trim();
    const loc = location.trim();
    if (name.length < 2) {
      toast.error("اكتب اسم العصابة المقترح (حرفان على الأقل)");
      return;
    }
    if (spec.length < 2) {
      toast.error("حدّد تخصص العصابة");
      return;
    }
    if (loc.length < 2) {
      toast.error("حدّد موقع أو نطاق العصابة");
      return;
    }
    setSubmitting(true);
    try {
      createGangOpenTicket({
        proposedName: name,
        specialty: spec,
        location: loc,
        body: body.trim(),
        openedBy: user.displayName || user.username,
        openedById: user.id,
        attachments: attachment ? [attachment] : [],
      });
      resetForm();
      onOpenChange(false);
      toast.success("تم إرسال طلب فتح العصابة", {
        description: MSG_TICKET_CREATED_WAIT_FOR_STAFF,
        duration: 9000,
      });
    } catch {
      toast.error("تعذر حفظ الطلب — جرّب تقليل حجم المرفق.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) resetForm();
        onOpenChange(next);
      }}
    >
      <DialogContent className="max-h-[90dvh] max-w-lg overflow-y-auto border-primary/25 bg-background text-right" dir="rtl">
        <DialogHeader className="text-right sm:text-right">
          <DialogTitle className="flex items-center justify-end gap-2 font-display text-xl">
            <Crown className="h-5 w-5 text-amber-500" aria-hidden />
            طلب فتح عصابة جديدة
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            يُراجع الطلب من مدير العصابات. عند الموافقة تُضاف العصابة للموقع وتُعيَّن لك قيادتها حسب قرار الإدارة.
          </DialogDescription>
        </DialogHeader>

        {!unlocked ? (
          <p className="rounded-xl border border-amber-400/30 bg-amber-500/10 px-3 py-2.5 text-sm text-amber-900 dark:text-amber-100">
            {MSG_POST_CITIZEN_APPROVED_NEEDED}
          </p>
        ) : existingOpen ? (
          <div className="space-y-3 rounded-xl border border-amber-400/30 bg-amber-500/10 px-4 py-3">
            <p className="text-sm">
              لديك طلب فتح قيد المتابعة
              {existingOpen.gangOpenProposedName ? ` — «${existingOpen.gangOpenProposedName}»` : ""}.
            </p>
            <Button asChild variant="outline" className="w-full gap-2 font-display">
              <Link to="/tickets">
                <MessageSquareMore className="h-4 w-4" />
                متابعة التكت
              </Link>
            </Button>
          </div>
        ) : (
          <div className="grid gap-4">
            <div className="space-y-2">
              <Label htmlFor="gang-open-name">اسم العصابة المقترح</Label>
              <Input
                id="gang-open-name"
                value={proposedName}
                onChange={(e) => setProposedName(e.target.value)}
                placeholder="مثال: Shadow Kings"
                className="border-primary/20 bg-muted/30"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="gang-open-spec">التخصص / النشاط</Label>
              <Input
                id="gang-open-spec"
                value={specialty}
                onChange={(e) => setSpecialty(e.target.value)}
                placeholder="مثال: تهريب، سيطرة مناطق…"
                className="border-primary/20 bg-muted/30"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="gang-open-loc">الموقع أو النطاق</Label>
              <Input
                id="gang-open-loc"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="مثال: جنوب المدينة، الميناء…"
                className="border-primary/20 bg-muted/30"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="gang-open-body">خطة العصابة وعدد الأعضاء المتوقع</Label>
              <Textarea
                id="gang-open-body"
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={4}
                placeholder="عرّب فكرة العصابة، خبرتك في الرول بلاي، ولماذا تستحق الفتح…"
                className="resize-y border-primary/20 bg-muted/30"
              />
            </div>
            <TicketAttachmentPicker attachment={attachment} onAttachmentChange={setAttachment} disabled={submitting} />
          </div>
        )}

        <DialogFooter className="flex-row-reverse gap-2 sm:justify-start">
          <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
            إغلاق
          </Button>
          {unlocked && !existingOpen ? (
            <Button
              type="button"
              className="gap-2 bg-gradient-neon font-display text-primary-foreground"
              disabled={submitting}
              onClick={submit}
            >
              <Send className="h-4 w-4" />
              إرسال طلب الفتح
            </Button>
          ) : null}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function GangOpenApplyTrigger({ className }: { className?: string }) {
  const [open, setOpen] = useState(false);
  const { user, getProfile } = usePublicUser();
  const { applications } = useApplicationsContent();
  const profile = user ? getProfile() : null;
  const unlocked = isPostCitizenApplyUnlocked(profile, applications);

  if (!user || !unlocked) return null;

  return (
    <>
      <Button type="button" onClick={() => setOpen(true)} className={className}>
        <Crown className="h-4 w-4 shrink-0 opacity-90" aria-hidden />
        <span>طلب فتح عصابة</span>
      </Button>
      <GangOpenApplyDialog open={open} onOpenChange={setOpen} />
    </>
  );
}

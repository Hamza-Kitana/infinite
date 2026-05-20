import { Crown, Sparkles } from "lucide-react";
import { PostCitizenApplyGate } from "@/components/PostCitizenApplyGate";
import { GangOpenApplyTrigger } from "@/components/gangs/GangOpenApplyDialog";
import { usePublicUser } from "@/contexts/PublicUserContext";
import { useApplicationsContent } from "@/contexts/ApplicationsContentContext";
import { isPostCitizenApplyUnlocked } from "@/lib/publicProfileEligibility";

export function GangsPublicApplySection() {
  const { user, getProfile } = usePublicUser();
  const { applications } = useApplicationsContent();
  const profile = user ? getProfile() : null;
  const unlocked = isPostCitizenApplyUnlocked(profile, applications);

  return (
    <section
      className="mt-10 w-full px-3 pb-4 sm:px-4 md:mt-14 md:px-8 md:pb-6 xl:px-12"
      id="gang-apply"
    >
      <div className="overflow-hidden rounded-[2rem] border border-primary/25 bg-gradient-to-br from-card/95 via-red-950/10 to-primary/5 p-6 shadow-[0_28px_80px_-36px_hsl(var(--primary)/0.45)] md:p-9">
        <div className="text-right">
          <p className="font-display text-[11px] tracking-[0.28em] text-primary/90">GANG APPLICATIONS</p>
          <h2 className="mt-2 font-display text-2xl font-bold md:text-3xl">
            التقديم على <span className="text-gradient-neon">العصابات</span>
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground md:text-base">
            لتأسيس عصابة جديدة — قدّم طلب فتح عصابة عبر نظام التكت؛ يُراجع الطلب من مدير العصابات.
          </p>
        </div>

        <div className="mt-8">
          <div className="rounded-2xl border border-amber-500/25 bg-gradient-to-bl from-amber-500/[0.08] to-background/40 p-5 text-right">
            <div className="flex items-start justify-between gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-500/15 text-amber-500">
                <Crown className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-display text-lg font-bold">طلب فتح عصابة</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  لمن يريد تأسيس عصابة جديدة — املأ الاسم المقترح والتخصص والموقع. يُراجع الطلب ويُضاف للموقع عند القبول.
                </p>
              </div>
            </div>
            <div className="mt-5">
              {user && unlocked ? (
                <GangOpenApplyTrigger className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-gradient-neon px-4 font-display text-sm font-semibold text-primary-foreground shadow-[0_0_24px_hsl(var(--primary)/0.35)] sm:w-auto" />
              ) : user ? (
                <PostCitizenApplyGate profile={profile} applications={applications} />
              ) : (
                <p className="text-xs text-muted-foreground">سجّل الدخول عبر Discord للتقديم.</p>
              )}
            </div>
          </div>
        </div>

        <p className="mt-6 flex items-center justify-end gap-2 border-t border-primary/15 pt-4 text-[11px] text-muted-foreground">
          <Sparkles className="h-3.5 w-3.5 text-primary/80" aria-hidden />
          يتطلب التقديم قبول تقديمك الإلكتروني كمواطن من الإدارة.
        </p>
      </div>
    </section>
  );
}

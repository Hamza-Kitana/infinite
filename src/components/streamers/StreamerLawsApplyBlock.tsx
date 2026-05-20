import { BookOpen, ChevronLeft, ScrollText, Video } from "lucide-react";
import { Sparkles } from "lucide-react";
import { usePublicUser } from "@/contexts/PublicUserContext";
import { useApplicationsContent } from "@/contexts/ApplicationsContentContext";
import { PostCitizenActionButton, PostCitizenApplyGate } from "@/components/PostCitizenApplyGate";
import { cn } from "@/lib/utils";

type StreamerLawsApplyBlockProps = {
  className?: string;
};

export function StreamerLawsApplyBlock({ className }: StreamerLawsApplyBlockProps) {
  const { user, getProfile } = usePublicUser();
  const { applications } = useApplicationsContent();
  const profile = user?.authProvider === "discord" ? getProfile() : null;

  return (
    <section className={cn("w-full px-4 md:px-8 xl:px-12 mt-10", className)}>
      <div className="relative overflow-hidden rounded-3xl border border-primary/25 bg-gradient-to-br from-card/95 via-primary/[0.07] to-secondary/[0.08] p-6 shadow-[0_24px_60px_-28px_rgba(54,22,79,0.35)] md:flex md:items-stretch md:justify-between md:gap-10 md:p-9">
        <div className="pointer-events-none absolute -start-24 top-1/2 h-48 w-48 -translate-y-1/2 rounded-full bg-primary/20 blur-3xl" />
        <div className="relative flex-1 text-right">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-background/50 px-3 py-1 font-display text-[11px] font-semibold text-primary">
            <Sparkles className="h-3.5 w-3.5" aria-hidden />
            قوانين وتقديم صانع المحتوى
          </div>
          <h2 className="mt-4 font-display text-2xl font-bold md:text-3xl">
            اقرأ <span className="text-gradient-neon">القوانين</span> ثم قدّم طلبك
          </h2>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground md:text-base">
            التقديم كصانع محتوى يظهر هنا فقط بعد قبول تقديمك الإلكتروني كمواطن. عند القبول من الإدارة تُضاف بطاقتك إلى صفحة
            صنّاع المحتوى.
          </p>
          <ul className="mt-5 space-y-2 text-sm text-muted-foreground">
            <li className="flex gap-2">
              <ScrollText className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
              <span>راجع قوانين المدينة قبل أي بث أو محتوى مرتبط بالسيرفر.</span>
            </li>
            <li className="flex gap-2">
              <Video className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
              <span>جهّز رابط البث واللوجو — النموذج يفتح من زر «تقديم كصانع محتوى».</span>
            </li>
          </ul>
        </div>

        <div className="relative mt-8 flex shrink-0 flex-col justify-center md:mt-0 md:min-w-[240px]">
          {user ? (
            <PostCitizenApplyGate profile={profile} applications={applications} className="md:flex-col md:items-stretch">
              <PostCitizenActionButton
                to="/laws"
                label="قوانين المدينة"
                variant="outline"
                icon={<BookOpen className="h-4 w-4" aria-hidden />}
              />
              <PostCitizenActionButton
                to="/apply/streamers"
                label="تقديم كصانع محتوى"
                icon={<ChevronLeft className="h-5 w-5 opacity-90" aria-hidden />}
              />
            </PostCitizenApplyGate>
          ) : (
            <p className="text-center text-sm text-muted-foreground md:text-right">
              سجّل الدخول عبر Discord لتظهر خيارات التقديم.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}

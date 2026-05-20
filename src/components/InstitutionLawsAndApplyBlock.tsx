import { useId } from "react";
import { BookOpen, Briefcase, ChevronLeft, ScrollText } from "lucide-react";
import { usePublicUser } from "@/contexts/PublicUserContext";
import { useApplicationsContent } from "@/contexts/ApplicationsContentContext";
import { JOB_ROLE_LAWS, type JobRoleKey } from "@/data/jobRoleLaws";
import { useJobRoleLawSet } from "@/lib/jobRoleLawsContent";
import { PostCitizenActionButton, PostCitizenApplyGate } from "@/components/PostCitizenApplyGate";
import { cn } from "@/lib/utils";

type InstitutionLawsAndApplyBlockProps = {
  organizationLabel: string;
  /** عند التحديد: قوانين الوظيفة + رابط التقديم `/jobs/apply/:role` */
  jobRoleKey?: JobRoleKey;
  /** بدون دور محدد — يوجّه لصفحة التوظيف العامة */
  jobsHubFallback?: boolean;
  className?: string;
};

/**
 * قسم قوانين المؤسسة مع أزرار القوانين والتقديم —
 * تظهر الأزرار فقط بعد قبول التقديم الإلكتروني للمواطن.
 */
export function InstitutionLawsAndApplyBlock({
  organizationLabel,
  jobRoleKey,
  jobsHubFallback = false,
  className,
}: InstitutionLawsAndApplyBlockProps) {
  const headingId = useId();
  const { user, getProfile } = usePublicUser();
  const { applications } = useApplicationsContent();
  const profile = user?.authProvider === "discord" ? getProfile() : null;

  const applyTo = jobRoleKey ? `/jobs/apply/${jobRoleKey}` : jobsHubFallback ? "/jobs" : null;

  return (
    <section className={cn("w-full px-4 md:px-8 xl:px-12 mt-12 md:mt-14", className)} aria-labelledby={headingId}>
      <div className="glass-panel overflow-hidden rounded-2xl border border-primary/25 bg-gradient-to-br from-card/95 via-primary/[0.04] to-secondary/[0.06] p-6 shadow-[0_20px_50px_-28px_hsl(var(--primary)/0.25)] md:p-8">
        <div className="flex flex-col gap-6 text-right md:flex-row md:items-start md:justify-between">
          <div className="flex min-w-0 items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary">
              <ScrollText className="h-6 w-6" aria-hidden />
            </div>
            <div className="min-w-0">
              <h2 id={headingId} className="font-display text-xl font-bold md:text-2xl">
                {jobRoleKey ? (
                  <InstitutionLawsHeading jobRoleKey={jobRoleKey} organizationLabel={organizationLabel} />
                ) : (
                  <>
                    قوانين <span className="text-gradient-neon">{organizationLabel}</span>
                  </>
                )}
              </h2>
              {jobRoleKey ? (
                <InstitutionLawsSubtitle jobRoleKey={jobRoleKey} organizationLabel={organizationLabel} />
              ) : (
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground md:text-base">
                  اطلع على اللائحة ثم قدّم عبر نظام التوظيف الإلكتروني بعد تفعيل حسابك كمواطن مقبول.
                </p>
              )}
            </div>
          </div>
        </div>

        {jobRoleKey ? (
          <InstitutionLawsRulesList jobRoleKey={jobRoleKey} organizationLabel={organizationLabel} />
        ) : (
          <p className="mt-6 rounded-xl border border-dashed border-primary/30 bg-muted/20 px-4 py-3 text-sm text-muted-foreground">
            اختر الجهة من صفحة التوظيف أو من أذرع الوزارة أعلاه للاطلاع على اللائحة الكاملة.
          </p>
        )}

        <div className="mt-8 border-t border-primary/15 pt-6">
          <p className="mb-4 font-display text-[11px] tracking-[0.22em] text-primary/90">التقديم والقوانين</p>
          {user ? (
            <PostCitizenApplyGate profile={profile} applications={applications}>
              <PostCitizenActionButton
                to="/laws"
                label="قوانين المدينة"
                variant="outline"
                icon={<BookOpen className="h-4 w-4 opacity-90" aria-hidden />}
              />
              {applyTo ? (
                <PostCitizenActionButton
                  to={applyTo}
                  label={jobRoleKey ? "تقديم على الوظيفة" : "صفحة التوظيف"}
                  icon={<Briefcase className="h-5 w-5 opacity-90" aria-hidden />}
                />
              ) : null}
            </PostCitizenApplyGate>
          ) : (
            <p className="text-sm text-muted-foreground">سجّل الدخول عبر Discord من الصفحة الرئيسية لتتمكن من التقديم.</p>
          )}
        </div>
      </div>
    </section>
  );
}

/** @deprecated استخدم InstitutionLawsAndApplyBlock */
function InstitutionLawsHeading({
  jobRoleKey,
  organizationLabel,
}: {
  jobRoleKey: JobRoleKey;
  organizationLabel: string;
}) {
  const lawSet = useJobRoleLawSet(jobRoleKey);
  const title = lawSet.title?.trim() || JOB_ROLE_LAWS[jobRoleKey].title;
  return <>{title || `قوانين ${organizationLabel}`}</>;
}

function InstitutionLawsSubtitle({
  jobRoleKey,
  organizationLabel,
}: {
  jobRoleKey: JobRoleKey;
  organizationLabel: string;
}) {
  const lawSet = useJobRoleLawSet(jobRoleKey);
  const subtitle = lawSet.subtitle?.trim() || JOB_ROLE_LAWS[jobRoleKey].subtitle;
  return (
    <p className="mt-2 text-sm leading-relaxed text-muted-foreground md:text-base">
      {subtitle || `لائحة ${organizationLabel} — اطلع عليها قبل التقديم.`}
    </p>
  );
}

function InstitutionLawsRulesList({
  jobRoleKey,
  organizationLabel,
}: {
  jobRoleKey: JobRoleKey;
  organizationLabel: string;
}) {
  const lawSet = useJobRoleLawSet(jobRoleKey);
  const fallback = JOB_ROLE_LAWS[jobRoleKey];
  const rules = lawSet.rules?.length ? lawSet.rules : fallback.rules;
  if (!rules.length) {
    return (
      <p className="mt-6 rounded-xl border border-dashed border-primary/30 bg-muted/20 px-4 py-3 text-sm text-muted-foreground">
        بنود اللائحة قيد التحديث من إدارة {organizationLabel}.
      </p>
    );
  }
  return (
    <ul className="mt-6 space-y-2.5 rounded-xl border border-primary/15 bg-muted/25 px-4 py-4">
      {rules.map((line, i) => (
        <li key={i} className="flex gap-2.5 text-sm leading-relaxed text-muted-foreground">
          <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" aria-hidden />
          <span className="min-w-0 flex-1">{line}</span>
        </li>
      ))}
    </ul>
  );
}

export function InstitutionLawsPlaceholder({
  organizationLabel,
  jobRoleKey,
  jobsHubFallback,
}: {
  organizationLabel: string;
  jobRoleKey?: JobRoleKey;
  jobsHubFallback?: boolean;
}) {
  return (
    <InstitutionLawsAndApplyBlock
      organizationLabel={organizationLabel}
      jobRoleKey={jobRoleKey}
      jobsHubFallback={jobsHubFallback}
    />
  );
}

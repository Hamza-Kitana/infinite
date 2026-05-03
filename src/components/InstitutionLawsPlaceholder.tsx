import { useId } from "react";
import { ScrollText } from "lucide-react";

type InstitutionLawsPlaceholderProps = {
  /** الاسم في العنوان، مثل: وزارة الصحة، الشرطة، الرقابة */
  organizationLabel: string;
};

/** قسم قوانين المؤسسة — محتوى مؤقت إلى حين توفير النصوص الرسمية */
export function InstitutionLawsPlaceholder({ organizationLabel }: InstitutionLawsPlaceholderProps) {
  const headingId = useId();

  return (
    <section className="w-full px-4 md:px-8 xl:px-12 mt-12 md:mt-14" aria-labelledby={headingId}>
      <div className="glass-panel rounded-2xl border border-dashed border-primary/35 bg-muted/20 p-6 md:p-8">
        <div className="flex flex-col gap-4 text-right md:flex-row md:items-start md:justify-between md:gap-8">
          <div className="flex min-w-0 items-start gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary">
              <ScrollText className="h-5 w-5" aria-hidden />
            </div>
            <div className="min-w-0">
              <h2 id={headingId} className="font-display text-xl font-bold md:text-2xl">
                قوانين <span className="text-gradient-neon">{organizationLabel}</span>
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground md:text-base">
                هذا القسم مخصص للائحة المؤسسة والبنود الرسمية التابعة لها. المحتوى قيد الإعداد؛ عند تزويدنا بالنصوص
                المعتمدة نحدّث الصفحة مباشرة.
              </p>
            </div>
          </div>
          <span className="inline-flex shrink-0 self-start rounded-full border border-primary/30 bg-primary/10 px-3 py-1.5 font-display text-[11px] font-semibold tracking-wide text-primary md:text-xs">
            قيد الإعداد — محتوى مؤقت
          </span>
        </div>
      </div>
    </section>
  );
}

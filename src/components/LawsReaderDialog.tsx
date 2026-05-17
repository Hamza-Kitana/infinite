import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { LawsQuizDialog } from "@/components/LawsQuizDialog";
import { useLawsContent } from "@/contexts/LawsContentContext";
import type { LawsQuizResult } from "@/data/publicApplicationTypes";
import { buildLawsReaderSlides, type LawsReaderSlide } from "@/lib/lawsReaderSlides";
import { useQuizQuestions } from "@/lib/lawsQuizContent";

function RulesBlock({
  heading,
  rules,
}: {
  heading: string;
  rules: { id: number; title: string; description: string }[];
}) {
  return (
    <section className="flex min-h-0 flex-1 flex-col">
      <h3 className="shrink-0 border-b border-primary/20 pb-3 font-display text-lg font-bold leading-tight text-primary sm:text-xl">
        {heading}
      </h3>
      <ul className="mt-5 space-y-5 pr-1 text-right">
        {rules.map((r) => (
          <li
            key={`${heading}-${r.id}`}
            className="rounded-xl border border-primary/10 bg-muted/20 px-4 py-3 transition-colors hover:border-primary/25"
          >
            <p className="font-display text-base font-semibold text-foreground sm:text-lg">{r.title}</p>
            <p className="mt-2 text-base leading-relaxed text-muted-foreground sm:text-[1.05rem] sm:leading-relaxed">
              {r.description}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}

function SafeZonesBlock({ title, zones }: { title: string; zones: { icon: string; label: string }[] }) {
  return (
    <section className="flex min-h-0 flex-1 flex-col">
      <h3 className="shrink-0 border-b border-primary/20 pb-3 font-display text-lg font-bold text-primary sm:text-xl">
        {title}
      </h3>
      <ul className="mt-5 flex flex-wrap content-start justify-end gap-2.5">
        {zones.map((z) => (
          <li
            key={z.label}
            className="rounded-xl border border-success/30 bg-success/10 px-3.5 py-2 text-sm text-foreground shadow-sm sm:px-4 sm:py-2.5 sm:text-base"
          >
            <span className="me-1.5 text-base sm:text-lg">{z.icon}</span>
            {z.label}
          </li>
        ))}
      </ul>
    </section>
  );
}

type LawsReaderDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** يُستدعى بعد تأكيد الاختبار — تُمرَّر نتيجة الاختبار لتُسجَّل مع الطلب */
  onAccept: (quizResult: LawsQuizResult) => void;
};

const LawsReaderDialog = ({ open, onOpenChange, onAccept }: LawsReaderDialogProps) => {
  const { sections } = useLawsContent();
  const contentSlides = useMemo(() => buildLawsReaderSlides(sections), [sections]);
  const ackSlideIndex = contentSlides.length;

  const [slide, setSlide] = useState(0);
  const [agreed, setAgreed] = useState(false);
  const [quizOpen, setQuizOpen] = useState(false);
  const citizenQuizQuestions = useQuizQuestions("citizen");

  const isAckSlide = slide === ackSlideIndex;

  useEffect(() => {
    if (open) {
      setSlide(0);
      setAgreed(false);
      setQuizOpen(false);
    }
  }, [open]);

  useEffect(() => {
    if (slide > ackSlideIndex) setSlide(ackSlideIndex);
  }, [ackSlideIndex, slide]);

  const handleClose = (next: boolean) => {
    if (!next) {
      setAgreed(false);
      setSlide(0);
      setQuizOpen(false);
    }
    onOpenChange(next);
  };

  /** الإقرار يفتح اختبار الأسئلة بدلاً من الاعتماد المباشر */
  const handleConfirm = () => {
    if (!agreed) return;
    setQuizOpen(true);
  };

  /** اكتمال الاختبار (نجاح أو إرسال رغم الرسوب) يعتمد الإقرار ويُغلق كل النوافذ */
  const handleQuizComplete = (result: LawsQuizResult) => {
    onAccept(result);
    setAgreed(false);
    setSlide(0);
    setQuizOpen(false);
    onOpenChange(false);
  };

  /** "أعد قراءة القوانين" يعيد المستخدم لأول شريحة محتوى */
  const handleQuizReread = () => {
    setQuizOpen(false);
    setAgreed(false);
    setSlide(0);
  };

  const renderContentSlide = (def: LawsReaderSlide) => {
    if (def.kind === "safeZones") {
      return <SafeZonesBlock title={def.title} zones={def.zones} />;
    }
    return <RulesBlock heading={def.title} rules={def.items} />;
  };

  return (
    <>
      <Dialog open={open && !quizOpen} onOpenChange={handleClose}>
        <DialogContent
          dir="rtl"
          className="flex h-[min(92vh,760px)] max-h-[92vh] max-w-5xl flex-col gap-0 overflow-hidden rounded-2xl border-primary/35 bg-background p-0 shadow-[0_0_60px_hsl(var(--primary)/0.18)] ring-1 ring-primary/15 sm:max-w-5xl"
        >
          <DialogHeader className="shrink-0 space-y-3 border-b border-primary/25 bg-gradient-to-l from-primary/[0.07] via-background to-background px-7 py-6 text-right md:px-8 md:py-7">
            <DialogTitle className="font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl md:text-[1.75rem]">
              <span className="text-gradient-neon">دستور المدينة</span>
              <span className="text-muted-foreground"> — </span>
              <span>القوانين</span>
            </DialogTitle>
            <DialogDescription className="text-right text-base leading-relaxed text-muted-foreground sm:text-lg">
              انتقل بـ «التالي» بين الأقسام؛ إذا كثرت البنود تُقسّم تلقائياً. للعرض الكامل:{" "}
              <Link to="/laws" className="font-semibold text-primary underline-offset-4 hover:underline">
                صفحة القوانين
              </Link>
              . أي قانون تُضيفه الإدارة في صفحة القوانين يظهر هنا مباشرة.
            </DialogDescription>
            <div className="flex flex-wrap items-center justify-end gap-2 pt-1">
              <span className="inline-flex rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 font-display text-sm font-semibold text-primary sm:text-base">
                {isAckSlide
                  ? "الخطوة الأخيرة — الإقرار"
                  : contentSlides.length === 0
                    ? "لا توجد بنود قوانين ظاهرة — انتقل للإقرار"
                    : `المقطع ${slide + 1} من ${contentSlides.length}`}
              </span>
            </div>
          </DialogHeader>

          <div className="flex min-h-0 flex-1 flex-col px-7 md:px-8">
            <div className="flex min-h-0 flex-1 flex-col justify-start py-5 md:py-6">
              {isAckSlide ? (
                <div className="flex min-h-0 flex-1 flex-col justify-center space-y-6 text-right">
                  <p className="text-lg leading-relaxed text-foreground sm:text-xl">
                    بعد الاطلاع على جميع الأقسام، أكّد قراءتك أدناه ثم أجب عن أسئلة قصيرة للتحقق من فهمك للقوانين قبل
                    متابعة الطلب.
                  </p>
                  {contentSlides.length === 0 ? (
                    <p className="rounded-xl border border-amber-400/30 bg-amber-500/10 px-4 py-3 text-sm leading-relaxed text-amber-200 sm:text-base">
                      لا توجد أقسام قوانين ظاهرة حالياً في صفحة الدستور — يمكنك المتابعة للإقرار والاختبار، أو مراجعة{" "}
                      <Link to="/laws" className="font-semibold text-primary underline">
                        صفحة القوانين
                      </Link>
                      .
                    </p>
                  ) : null}
                  <div className="flex items-start gap-4 rounded-2xl border border-primary/25 bg-card/50 p-5 shadow-inner sm:p-6">
                    <Checkbox
                      id="laws-agree"
                      checked={agreed}
                      onCheckedChange={(v) => setAgreed(v === true)}
                      className="mt-1 h-5 w-5 border-primary/50 data-[state=checked]:bg-primary"
                    />
                    <Label htmlFor="laws-agree" className="cursor-pointer text-base leading-relaxed text-foreground sm:text-lg">
                      أقر بأنني اطلعت على القوانين وأفهم أن الالتزام بها شرط للعب في المدينة.
                    </Label>
                  </div>
                  <p className="rounded-xl border border-amber-400/30 bg-amber-500/10 px-4 py-3 text-sm leading-relaxed text-amber-200 sm:text-base">
                    بعد ضغط «متابعة وأسئلة الإقرار»، سيُعرض عليك اختبار قصير من {citizenQuizQuestions.length} أسئلة. لن
                    يُعتمد إقرارك إلا بالإجابة الصحيحة على الأسئلة جميعها.
                  </p>
                </div>
              ) : contentSlides[slide] ? (
                renderContentSlide(contentSlides[slide]!)
              ) : null}
            </div>
          </div>

          {!isAckSlide ? (
            <DialogFooter className="shrink-0 flex-row-reverse flex-wrap gap-3 border-t border-primary/25 bg-card/50 px-7 py-4 sm:justify-between md:px-8 md:py-5">
              <Button
                type="button"
                onClick={() => setSlide((s) => Math.min(ackSlideIndex, s + 1))}
                className="h-12 min-w-[7.5rem] bg-gradient-neon px-6 font-display text-base text-primary-foreground shadow-[0_0_24px_hsl(var(--primary)/0.35)]"
              >
                {slide + 1 >= contentSlides.length ? "الإقرار" : "التالي"}
              </Button>
              <div className="flex flex-wrap gap-2">
                {slide > 0 ? (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setSlide((s) => s - 1)}
                    className="h-12 min-w-[6rem] border-primary/35 font-display text-base"
                  >
                    السابق
                  </Button>
                ) : null}
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => handleClose(false)}
                  className="h-12 font-display text-base text-muted-foreground hover:text-foreground"
                >
                  إغلاق
                </Button>
              </div>
            </DialogFooter>
          ) : (
            <DialogFooter className="shrink-0 flex-col gap-4 border-t border-primary/25 bg-card/50 px-7 py-4 sm:flex-col md:px-8 md:py-5">
              <div className="flex w-full flex-col-reverse gap-3 sm:flex-row sm:justify-between" dir="ltr">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setSlide(Math.max(0, ackSlideIndex - 1))}
                  disabled={contentSlides.length === 0}
                  className="h-12 min-w-[6rem] border-primary/35 font-display text-base"
                >
                  السابق
                </Button>
                <div className="flex flex-wrap justify-end gap-2">
                  <Button type="button" variant="ghost" onClick={() => handleClose(false)} className="h-12 font-display text-base">
                    إغلاق
                  </Button>
                  <Button
                    type="button"
                    disabled={!agreed}
                    onClick={handleConfirm}
                    className="h-12 min-w-[12rem] bg-gradient-neon px-5 font-display text-base text-primary-foreground shadow-[0_0_24px_hsl(var(--primary)/0.35)] disabled:opacity-40"
                  >
                    متابعة وأسئلة الإقرار
                  </Button>
                </div>
              </div>
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>
      <LawsQuizDialog
        open={quizOpen}
        onOpenChange={(next) => {
          setQuizOpen(next);
          if (!next) {
            setAgreed(false);
          }
        }}
        questions={citizenQuizQuestions}
        contextLabel="قوانين المدينة"
        onComplete={handleQuizComplete}
        onReread={handleQuizReread}
      />
    </>
  );
};

export default LawsReaderDialog;

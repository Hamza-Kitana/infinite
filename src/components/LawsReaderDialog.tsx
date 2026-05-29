import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { BookOpen, CheckSquare, LayoutGrid, Square } from "lucide-react";
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
import type { QuizQuestion } from "@/data/lawsQuiz";
import type { LawsQuizResult } from "@/data/publicApplicationTypes";
import {
  buildLawsReaderSlides,
  filterSlidesBySectionIds,
  type LawsReaderSlide,
} from "@/lib/lawsReaderSlides";
import { useQuizAttemptSettings, useQuizQuestions } from "@/lib/lawsQuizContent";
import { pickRandomQuizQuestions } from "@/lib/quizSession";
import type { LawTabSection } from "@/types/lawsSchema";
import { cn } from "@/lib/utils";

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

function SectionPickerCard({
  section,
  checked,
  onToggle,
}: {
  section: LawTabSection;
  checked: boolean;
  onToggle: (next: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onToggle(!checked)}
      className={cn(
        "group relative flex w-full flex-col gap-2 rounded-2xl border p-4 text-right transition-all sm:p-5",
        "hover:-translate-y-0.5 hover:shadow-[0_18px_42px_-22px_hsl(var(--primary)/0.35)]",
        checked
          ? "border-primary/70 bg-primary/[0.08] ring-1 ring-primary/40"
          : "border-primary/20 bg-card/40 hover:border-primary/40",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <span className="text-2xl sm:text-3xl" aria-hidden>
          {section.icon}
        </span>
        <span
          className={cn(
            "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border transition-colors",
            checked
              ? "border-primary/60 bg-primary text-primary-foreground"
              : "border-primary/30 bg-background/70 text-muted-foreground group-hover:border-primary/50",
          )}
          aria-hidden
        >
          {checked ? <CheckSquare className="h-4 w-4" /> : <Square className="h-4 w-4" />}
        </span>
      </div>
      <div className="space-y-1">
        <p className="font-display text-base font-bold text-foreground sm:text-lg">{section.label}</p>
        <p className="text-sm leading-relaxed text-muted-foreground">{section.short || section.subtitle}</p>
      </div>
    </button>
  );
}

type ReaderPhase = "sections" | "reading";

type LawsReaderDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** يُستدعى بعد تأكيد الاختبار — تُمرَّر نتيجة الاختبار لتُسجَّل مع الطلب */
  onAccept: (quizResult: LawsQuizResult) => void;
};

const LawsReaderDialog = ({ open, onOpenChange, onAccept }: LawsReaderDialogProps) => {
  const { sections } = useLawsContent();
  const visibleSections = useMemo(() => sections.filter((s) => !s.hidden), [sections]);
  const allSlides = useMemo(() => buildLawsReaderSlides(sections), [sections]);

  const [phase, setPhase] = useState<ReaderPhase>("sections");
  const [selectedSectionIds, setSelectedSectionIds] = useState<Set<string>>(() => new Set());
  const [slide, setSlide] = useState(0);
  const [agreed, setAgreed] = useState(false);
  const [quizOpen, setQuizOpen] = useState(false);
  const [quizSessionQuestions, setQuizSessionQuestions] = useState<QuizQuestion[]>([]);

  const citizenQuizQuestions = useQuizQuestions("citizen");
  const quizAttemptSettings = useQuizAttemptSettings("citizen");

  const contentSlides = useMemo(
    () => filterSlidesBySectionIds(allSlides, selectedSectionIds),
    [allSlides, selectedSectionIds],
  );
  const ackSlideIndex = contentSlides.length;
  const isAckSlide = phase === "reading" && slide === ackSlideIndex;

  const questionsPerAttempt = Math.min(
    quizAttemptSettings.questionsPerAttempt,
    Math.max(1, citizenQuizQuestions.length),
  );

  useEffect(() => {
    if (open) {
      setPhase("sections");
      setSelectedSectionIds(new Set(visibleSections.map((s) => s.id)));
      setSlide(0);
      setAgreed(false);
      setQuizOpen(false);
      setQuizSessionQuestions([]);
    }
  }, [open, visibleSections]);

  useEffect(() => {
    if (phase === "reading" && slide > ackSlideIndex) setSlide(ackSlideIndex);
  }, [ackSlideIndex, phase, slide]);

  const selectedSectionLabels = useMemo(
    () => visibleSections.filter((s) => selectedSectionIds.has(s.id)).map((s) => s.label),
    [selectedSectionIds, visibleSections],
  );

  const handleClose = (next: boolean) => {
    if (!next) {
      setPhase("sections");
      setAgreed(false);
      setSlide(0);
      setQuizOpen(false);
    }
    onOpenChange(next);
  };

  const toggleSection = (sectionId: string, next: boolean) => {
    setSelectedSectionIds((prev) => {
      const copy = new Set(prev);
      if (next) copy.add(sectionId);
      else copy.delete(sectionId);
      return copy;
    });
  };

  const selectAllSections = () => {
    setSelectedSectionIds(new Set(visibleSections.map((s) => s.id)));
  };

  const clearAllSections = () => {
    setSelectedSectionIds(new Set());
  };

  const startReading = () => {
    if (selectedSectionIds.size === 0) return;
    setPhase("reading");
    setSlide(0);
    setAgreed(false);
  };

  const backToSections = () => {
    setPhase("sections");
    setSlide(0);
    setAgreed(false);
  };

  /** الإقرار يفتح اختبار الأسئلة بدلاً من الاعتماد المباشر */
  const handleConfirm = () => {
    if (!agreed) return;
    setQuizSessionQuestions(pickRandomQuizQuestions(citizenQuizQuestions, quizAttemptSettings.questionsPerAttempt));
    setQuizOpen(true);
  };

  /** اكتمال الاختبار (نجاح أو إرسال رغم الرسوب) يعتمد الإقرار ويُغلق كل النوافذ */
  const handleQuizComplete = (result: LawsQuizResult) => {
    onAccept({
      ...result,
      poolSize: citizenQuizQuestions.length,
      questionsPerAttempt: quizAttemptSettings.questionsPerAttempt,
      askedQuestionIds: quizSessionQuestions.map((q) => q.id),
      selectedLawSectionIds: Array.from(selectedSectionIds),
      selectedLawSectionLabels: selectedSectionLabels,
    });
    setPhase("sections");
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

  const stepBadge =
    phase === "sections"
      ? `اختيار الأقسام — ${selectedSectionIds.size} من ${visibleSections.length}`
      : isAckSlide
        ? "الخطوة الأخيرة — الإقرار"
        : contentSlides.length === 0
          ? "لا توجد بنود في الأقسام المختارة — انتقل للإقرار"
          : `المقطع ${slide + 1} من ${contentSlides.length}`;

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
              <span>{phase === "sections" ? "اختيار الأقسام" : "القوانين"}</span>
            </DialogTitle>
            <DialogDescription className="text-right text-base leading-relaxed text-muted-foreground sm:text-lg">
              {phase === "sections" ? (
                <>
                  اختر الأقسام التي تريد قراءتها قبل التقديم — يمكنك تحديد الكل أو بعض الأقسام فقط. للعرض الكامل:{" "}
                  <Link to="/laws" className="font-semibold text-primary underline-offset-4 hover:underline">
                    صفحة القوانين
                  </Link>
                  .
                </>
              ) : (
                <>
                  انتقل بـ «التالي» بين الأقسام المختارة. للعرض الكامل:{" "}
                  <Link to="/laws" className="font-semibold text-primary underline-offset-4 hover:underline">
                    صفحة القوانين
                  </Link>
                  .
                </>
              )}
            </DialogDescription>
            <div className="flex flex-wrap items-center justify-end gap-2 pt-1">
              <span className="inline-flex rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 font-display text-sm font-semibold text-primary sm:text-base">
                {stepBadge}
              </span>
            </div>
          </DialogHeader>

          <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-7 md:px-8">
            <div className="flex min-h-0 flex-1 flex-col justify-start py-5 md:py-6">
              {phase === "sections" ? (
                <div className="space-y-5 text-right">
                  <div className="rounded-2xl border border-primary/20 bg-card/40 p-4 sm:p-5">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground sm:text-base">
                        <LayoutGrid className="h-5 w-5 text-primary" aria-hidden />
                        <span>
                          {visibleSections.length === 0
                            ? "لا توجد أقسام ظاهرة حالياً"
                            : "حدّد الأقسام التي تريد الاطلاع عليها قبل الإقرار والاختبار"}
                        </span>
                      </div>
                      {visibleSections.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={selectAllSections}
                            className="border-primary/35 font-display"
                          >
                            تحديد الكل
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={clearAllSections}
                            className="font-display text-muted-foreground hover:text-foreground"
                          >
                            إلغاء الكل
                          </Button>
                        </div>
                      ) : null}
                    </div>
                  </div>

                  {visibleSections.length === 0 ? (
                    <p className="rounded-xl border border-amber-400/30 bg-amber-500/10 px-4 py-3 text-sm leading-relaxed text-amber-200 sm:text-base">
                      لا توجد أقسام قوانين ظاهرة — يمكنك المتابعة للإقرار مباشرة، أو مراجعة{" "}
                      <Link to="/laws" className="font-semibold text-primary underline">
                        صفحة القوانين
                      </Link>
                      .
                    </p>
                  ) : (
                    <div className="grid gap-3 sm:grid-cols-2">
                      {visibleSections.map((section) => (
                        <SectionPickerCard
                          key={section.id}
                          section={section}
                          checked={selectedSectionIds.has(section.id)}
                          onToggle={(next) => toggleSection(section.id, next)}
                        />
                      ))}
                    </div>
                  )}

                  {selectedSectionIds.size > 0 ? (
                    <p className="rounded-xl border border-primary/20 bg-primary/5 px-4 py-3 text-sm leading-relaxed text-foreground sm:text-base">
                      <BookOpen className="mb-0.5 ms-1 inline h-4 w-4 text-primary" aria-hidden />
                      ستقرأ: <strong>{selectedSectionLabels.join(" · ")}</strong>
                    </p>
                  ) : null}
                </div>
              ) : isAckSlide ? (
                <div className="flex min-h-0 flex-1 flex-col justify-center space-y-6 text-right">
                  <p className="text-lg leading-relaxed text-foreground sm:text-xl">
                    بعد الاطلاع على الأقسام التي اخترتها، أكّد قراءتك أدناه ثم أجب عن أسئلة للتحقق من فهمك قبل
                    متابعة الطلب.
                  </p>
                  {selectedSectionLabels.length > 0 ? (
                    <p className="rounded-xl border border-primary/20 bg-primary/5 px-4 py-3 text-sm leading-relaxed text-foreground sm:text-base">
                      الأقسام المختارة: <strong>{selectedSectionLabels.join(" · ")}</strong>
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
                      أقر بأنني اطلعت على القوانين المختارة وأفهم أن الالتزام بها شرط للعب في المدينة.
                    </Label>
                  </div>
                  <p className="rounded-xl border border-amber-400/30 bg-amber-500/10 px-4 py-3 text-sm leading-relaxed text-amber-200 sm:text-base">
                    بعد ضغط «متابعة وأسئلة الإقرار»، سيُعرض عليك اختبار من{" "}
                    <strong>{questionsPerAttempt}</strong> أسئلة عشوائية من بنك{" "}
                    <strong>{citizenQuizQuestions.length}</strong> سؤال. لن يُعتمد إقرارك إلا بالإجابة الصحيحة على
                    الأسئلة جميعها.
                  </p>
                </div>
              ) : contentSlides[slide] ? (
                renderContentSlide(contentSlides[slide]!)
              ) : null}
            </div>
          </div>

          {phase === "sections" ? (
            <DialogFooter className="shrink-0 flex-row-reverse flex-wrap gap-3 border-t border-primary/25 bg-card/50 px-7 py-4 sm:justify-between md:px-8 md:py-5">
              <Button
                type="button"
                disabled={visibleSections.length > 0 && selectedSectionIds.size === 0}
                onClick={startReading}
                className="h-12 min-w-[9rem] bg-gradient-neon px-6 font-display text-base text-primary-foreground shadow-[0_0_24px_hsl(var(--primary)/0.35)] disabled:opacity-40"
              >
                متابعة للقراءة
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={() => handleClose(false)}
                className="h-12 font-display text-base text-muted-foreground hover:text-foreground"
              >
                إغلاق
              </Button>
            </DialogFooter>
          ) : !isAckSlide ? (
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
                ) : (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={backToSections}
                    className="h-12 min-w-[7rem] border-primary/35 font-display text-base"
                  >
                    تغيير الأقسام
                  </Button>
                )}
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
        questions={quizSessionQuestions}
        contextLabel="قوانين المدينة"
        onComplete={handleQuizComplete}
        onReread={handleQuizReread}
      />
    </>
  );
};

export default LawsReaderDialog;

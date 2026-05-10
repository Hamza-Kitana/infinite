import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  BookOpenCheck,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ShieldQuestion,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { QuizQuestion } from "@/data/lawsQuiz";
import type { LawsQuizAnswer, LawsQuizResult } from "@/data/publicApplicationTypes";

type LawsQuizDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /**
   * يُستدعى عند تأكيد الإقرار — سواء بنجاح كامل أو بقرار المتابعة رغم الرسوب.
   * النتيجة تُسجَّل في الطلب لتظهر للأدمن (passed=false عند الإرسال بعد رسوب).
   */
  onComplete: (result: LawsQuizResult) => void;
  /** يُستدعى عند ضغط "أعد قراءة القوانين" — لإعادة المستخدم إلى عرض القوانين */
  onReread?: () => void;
  /** قائمة الأسئلة — مصدرها CITIZEN_LAWS_QUIZ أو JOB_ROLE_LAWS_QUIZ[role] */
  questions: QuizQuestion[];
  /** عنوان فرعي يصف المؤسسة/المجموعة (مثلاً: «قوانين وزارة الصحة») */
  contextLabel?: string;
};

type Phase = "answering" | "failed" | "passed";

export function LawsQuizDialog({
  open,
  onOpenChange,
  onComplete,
  onReread,
  questions,
  contextLabel,
}: LawsQuizDialogProps) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [phase, setPhase] = useState<Phase>("answering");
  const [attempts, setAttempts] = useState(0);
  /** فهرس السؤال الحالي (Stepper-like) */
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (open) {
      setAnswers({});
      setPhase("answering");
      setAttempts(0);
      setCurrentIndex(0);
    }
  }, [open]);

  const total = questions.length;
  const currentQuestion = questions[currentIndex];
  const currentAnswer = currentQuestion ? answers[currentQuestion.id] : undefined;
  const isLastQuestion = currentIndex === total - 1;

  const allAnswered = useMemo(
    () => questions.every((q) => typeof answers[q.id] === "string" && answers[q.id]!.length > 0),
    [questions, answers],
  );

  const wrongIds = useMemo(
    () => questions.filter((q) => answers[q.id] !== q.correctOptionId).map((q) => q.id),
    [questions, answers],
  );

  const buildResult = (passed: boolean, attemptsCount: number): LawsQuizResult => {
    const detailed: LawsQuizAnswer[] = questions.map((q) => {
      const selectedId = answers[q.id] ?? "";
      const selectedOpt = q.options.find((o) => o.id === selectedId);
      const correctOpt = q.options.find((o) => o.id === q.correctOptionId);
      return {
        questionId: q.id,
        question: q.question,
        selectedOptionId: selectedId,
        selectedOptionLabel: selectedOpt?.label ?? "",
        correctOptionId: q.correctOptionId,
        correctOptionLabel: correctOpt?.label ?? "",
        isCorrect: selectedId === q.correctOptionId,
      };
    });
    return {
      passed,
      correctCount: detailed.filter((a) => a.isCorrect).length,
      totalQuestions: questions.length,
      attempts: Math.max(1, attemptsCount),
      completedAt: new Date().toISOString(),
      answers: detailed,
    };
  };

  const handleSubmit = () => {
    if (!allAnswered) return;
    const nextAttempts = attempts + 1;
    setAttempts(nextAttempts);
    if (wrongIds.length === 0) {
      setPhase("passed");
      const result = buildResult(true, nextAttempts);
      window.setTimeout(() => {
        onComplete(result);
        onOpenChange(false);
      }, 900);
      return;
    }
    setPhase("failed");
  };

  const handleReread = () => {
    setAnswers({});
    setPhase("answering");
    setAttempts(0);
    setCurrentIndex(0);
    onOpenChange(false);
    onReread?.();
  };

  const goNext = () => {
    if (!currentAnswer) return;
    if (isLastQuestion) {
      handleSubmit();
      return;
    }
    setCurrentIndex((i) => Math.min(total - 1, i + 1));
  };

  const goBack = () => {
    setCurrentIndex((i) => Math.max(0, i - 1));
  };

  const progressPct = total > 0 ? ((currentIndex + (currentAnswer ? 1 : 0)) / total) * 100 : 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        dir="rtl"
        className="flex h-[min(94vh,820px)] max-h-[94vh] max-w-5xl flex-col gap-0 overflow-hidden rounded-2xl border-primary/35 bg-background p-0 shadow-[0_0_60px_hsl(var(--primary)/0.18)] ring-1 ring-primary/15"
      >
        <DialogHeader className="shrink-0 space-y-3 border-b border-primary/25 bg-gradient-to-l from-primary/[0.07] via-background to-background px-7 py-6 text-right md:px-9 md:py-7">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <DialogTitle className="flex items-center gap-2 font-display text-2xl font-bold text-foreground sm:text-3xl">
              <ShieldQuestion className="h-7 w-7 text-primary" aria-hidden />
              <span>اختبار الاطلاع على القوانين</span>
            </DialogTitle>
            {phase === "answering" ? (
              <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 font-display text-sm font-semibold text-primary">
                السؤال {currentIndex + 1} من {total}
              </span>
            ) : (
              <span className="inline-flex rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 font-display text-sm font-semibold text-primary">
                {total} أسئلة
              </span>
            )}
          </div>
          <DialogDescription className="text-base leading-relaxed text-muted-foreground sm:text-lg">
            {contextLabel ? (
              <>
                للتحقق من قراءتك لـ
                <span className="mx-1 font-semibold text-foreground">{contextLabel}</span>،
                أجب عن سؤال واحد في كل خطوة. ستُسجَّل نتيجتك مع الطلب للمراجعة من الإدارة.
              </>
            ) : (
              "أجب عن سؤال واحد في كل خطوة وانتقل بزر «التالي»."
            )}
          </DialogDescription>
          {phase === "answering" ? (
            <div
              className="relative h-1.5 w-full overflow-hidden rounded-full bg-primary/10"
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={Math.round(progressPct)}
            >
              <motion.div
                className="absolute right-0 top-0 h-full rounded-full bg-gradient-to-l from-primary to-secondary"
                initial={false}
                animate={{ width: `${progressPct}%` }}
                transition={{ type: "spring", stiffness: 220, damping: 30 }}
              />
            </div>
          ) : null}
        </DialogHeader>

        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-7 py-6 md:px-10 md:py-8">
          {phase === "passed" ? (
            <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-5 text-center">
              <div className="relative">
                <span
                  aria-hidden
                  className="absolute inset-0 -z-10 animate-ping rounded-full bg-emerald-500/30 blur-2xl"
                />
                <div className="flex h-28 w-28 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-400 ring-2 ring-emerald-400/50 shadow-[0_0_40px_hsl(150_70%_45%/0.45)]">
                  <CheckCircle2 className="h-16 w-16" strokeWidth={2.2} />
                </div>
              </div>
              <h2 className="font-display text-2xl font-bold text-emerald-300 sm:text-3xl">
                أحسنت — اجتزت الاختبار
              </h2>
              <p className="max-w-md text-base leading-relaxed text-muted-foreground sm:text-lg">
                تم اعتماد إقرارك بقراءة القوانين. جارٍ متابعة الطلب…
              </p>
            </div>
          ) : phase === "failed" ? (
            <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-5 text-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-rose-500/15 text-rose-400 ring-1 ring-rose-400/40">
                <AlertTriangle className="h-10 w-10" />
              </div>
              <h2 className="font-display text-2xl font-bold text-foreground sm:text-3xl">
                إجاباتك غير صحيحة
              </h2>
              <p className="max-w-md text-base leading-relaxed text-muted-foreground sm:text-lg">
                اذهب وراجع القوانين من فضلك ثم عُد للمحاولة مرة أخرى. لن نُظهر لك الإجابات
                الصحيحة — التزم بالقراءة الجادّة للقوانين.
              </p>
            </div>
          ) : currentQuestion ? (
            <AnimatePresence mode="wait">
              <motion.div
                key={currentQuestion.id}
                initial={{ opacity: 0, x: -36 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 36 }}
                transition={{ duration: 0.28, ease: "easeOut" }}
                className="mx-auto flex w-full max-w-3xl flex-col"
              >
                <div className="mb-4 flex items-center justify-end gap-2">
                  <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-primary/15 font-display text-sm font-bold text-primary ring-1 ring-primary/30">
                    {currentIndex + 1}
                  </span>
                  <span className="font-display text-xs uppercase tracking-[0.32em] text-primary/80">
                    سؤال
                  </span>
                </div>
                <h3 className="text-right font-display text-2xl font-bold leading-snug text-foreground sm:text-3xl md:text-[1.7rem]">
                  {currentQuestion.question}
                </h3>
                <p className="mt-3 text-right text-sm leading-relaxed text-muted-foreground sm:text-base">
                  اختر الإجابة الصحيحة من بين الخيارات التالية. عند الاختيار اضغط
                  «التالي» للانتقال للسؤال الذي يليه.
                </p>

                <div className="mt-7 grid gap-3 sm:grid-cols-2">
                  {currentQuestion.options.map((opt, optIdx) => {
                    const isSelected = currentAnswer === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() =>
                          setAnswers((prev) => ({ ...prev, [currentQuestion.id]: opt.id }))
                        }
                        className={cn(
                          "group relative flex items-start gap-3 rounded-2xl border bg-card/40 p-4 text-right transition-all sm:p-5",
                          "hover:-translate-y-0.5 hover:border-primary/45 hover:shadow-[0_18px_42px_-22px_hsl(var(--primary)/0.4)]",
                          isSelected
                            ? "border-primary/70 bg-primary/[0.08] shadow-[0_18px_42px_-22px_hsl(var(--primary)/0.5)] ring-1 ring-primary/40"
                            : "border-primary/20",
                        )}
                      >
                        <span
                          className={cn(
                            "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border font-display text-sm font-bold transition-colors",
                            isSelected
                              ? "border-primary/60 bg-primary text-primary-foreground"
                              : "border-primary/30 bg-background/60 text-primary",
                          )}
                          aria-hidden
                        >
                          {isSelected ? (
                            <Check className="h-5 w-5" strokeWidth={3} />
                          ) : (
                            String.fromCharCode(65 + optIdx)
                          )}
                        </span>
                        <span className="min-w-0 flex-1 text-base leading-relaxed text-foreground/90 sm:text-lg">
                          {opt.label}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/** عرض الأسئلة الأخرى التي لم تُجَب عند اقتراب النهاية كتذكير */}
                {isLastQuestion && !allAnswered ? (
                  <p className="mt-5 rounded-xl border border-amber-400/30 bg-amber-500/10 px-4 py-3 text-right text-sm leading-relaxed text-amber-200 sm:text-base">
                    لم تُجِب على بعض الأسئلة السابقة — استخدم زر «السابق» للعودة
                    وإكمالها قبل التأكيد.
                  </p>
                ) : null}
              </motion.div>
            </AnimatePresence>
          ) : null}
        </div>

        {phase === "passed" ? null : (
          <DialogFooter className="shrink-0 flex-row-reverse flex-wrap gap-2 border-t border-primary/25 bg-card/50 px-7 py-4 sm:justify-between md:px-10 md:py-5">
            {phase === "failed" ? (
              <>
                <Button
                  type="button"
                  onClick={handleReread}
                  className="h-12 min-w-[15rem] gap-2 bg-gradient-neon px-6 font-display text-base text-primary-foreground shadow-[0_0_24px_hsl(var(--primary)/0.35)]"
                >
                  <BookOpenCheck className="h-5 w-5" />
                  العودة لقراءة القوانين
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => onOpenChange(false)}
                  className="h-12 font-display text-base text-muted-foreground hover:text-foreground"
                >
                  إغلاق
                </Button>
              </>
            ) : (
              <>
                <Button
                  type="button"
                  disabled={!currentAnswer || (isLastQuestion && !allAnswered)}
                  onClick={goNext}
                  className="h-12 min-w-[10rem] gap-2 bg-gradient-neon px-6 font-display text-base text-primary-foreground shadow-[0_0_24px_hsl(var(--primary)/0.35)] disabled:opacity-40"
                >
                  {isLastQuestion ? (
                    <>
                      <CheckCircle2 className="h-5 w-5" />
                      تأكيد إجاباتي
                    </>
                  ) : (
                    <>
                      التالي
                      <ChevronLeft className="h-5 w-5" />
                    </>
                  )}
                </Button>
                <div className="flex flex-wrap gap-2">
                  {currentIndex > 0 ? (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={goBack}
                      className="h-12 min-w-[6rem] gap-2 border-primary/35 font-display text-base"
                    >
                      <ChevronRight className="h-5 w-5" />
                      السابق
                    </Button>
                  ) : null}
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => onOpenChange(false)}
                    className="h-12 font-display text-base text-muted-foreground hover:text-foreground"
                  >
                    إغلاق
                  </Button>
                </div>
              </>
            )}
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default LawsQuizDialog;

import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, HelpCircle, Plus, RotateCcw, Save, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import type { QuizQuestion } from "@/data/lawsQuiz";
import { appendActivityLog } from "@/lib/activityLog";
import {
  QUIZ_CONTEXTS,
  resetQuizQuestions,
  saveQuizQuestions,
  loadQuizQuestions,
  LAWS_QUIZ_CONTENT_CHANGED_EVENT,
  LAWS_QUIZ_STORAGE_KEY,
  type QuizContextKey,
} from "@/lib/lawsQuizContent";
import { cn } from "@/lib/utils";

const OPTION_IDS = ["a", "b", "c", "d", "e", "f"] as const;

function makeQuestion(): QuizQuestion {
  return {
    id: crypto.randomUUID(),
    question: "",
    options: [
      { id: "a", label: "" },
      { id: "b", label: "" },
    ],
    correctOptionId: "a",
  };
}

function cleanQuestions(questions: QuizQuestion[]): QuizQuestion[] | null {
  const cleaned = questions.map((q) => {
    const options = q.options
      .map((opt, idx) => ({
        id: opt.id.trim() || OPTION_IDS[idx] || crypto.randomUUID(),
        label: opt.label.trim(),
      }))
      .filter((opt) => opt.label.length > 0);
    const correctOptionId = options.some((opt) => opt.id === q.correctOptionId)
      ? q.correctOptionId
      : (options[0]?.id ?? "");
    return {
      ...q,
      id: q.id || crypto.randomUUID(),
      question: q.question.trim(),
      options,
      correctOptionId,
      explanation: q.explanation?.trim() || undefined,
    };
  });

  if (cleaned.some((q) => q.question.length < 5)) {
    toast.error("كل سؤال يجب أن يحتوي نصاً واضحاً");
    return null;
  }
  if (cleaned.some((q) => q.options.length < 2)) {
    toast.error("كل سؤال يحتاج خيارين على الأقل");
    return null;
  }
  if (cleaned.some((q) => !q.correctOptionId || !q.options.some((opt) => opt.id === q.correctOptionId))) {
    toast.error("حدد الإجابة الصحيحة لكل سؤال");
    return null;
  }
  return cleaned;
}

function cloneQuizQuestions(list: QuizQuestion[]): QuizQuestion[] {
  return list.map((q) => ({
    ...q,
    options: q.options.map((opt) => ({ ...opt })),
  }));
}

const QuizManagerPage = () => {
  const { user } = useAuth();
  const [activeKey, setActiveKey] = useState<QuizContextKey>("citizen");
  const [draft, setDraft] = useState<QuizQuestion[]>(() => cloneQuizQuestions(loadQuizQuestions("citizen")));

  useEffect(() => {
    const hydrate = () => {
      setDraft(cloneQuizQuestions(loadQuizQuestions(activeKey)));
    };
    hydrate();
    window.addEventListener(LAWS_QUIZ_CONTENT_CHANGED_EVENT, hydrate);
    const onStorage = (e: StorageEvent) => {
      if (e.key === LAWS_QUIZ_STORAGE_KEY) hydrate();
    };
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener(LAWS_QUIZ_CONTENT_CHANGED_EVENT, hydrate);
      window.removeEventListener("storage", onStorage);
    };
  }, [activeKey]);

  const activeMeta = useMemo(
    () => QUIZ_CONTEXTS.find((ctx) => ctx.key === activeKey) ?? QUIZ_CONTEXTS[0],
    [activeKey],
  );

  const updateQuestion = (id: string, patch: Partial<QuizQuestion>) => {
    setDraft((prev) => prev.map((q) => (q.id === id ? { ...q, ...patch } : q)));
  };

  const updateOption = (questionId: string, optionId: string, label: string) => {
    setDraft((prev) =>
      prev.map((q) =>
        q.id === questionId
          ? { ...q, options: q.options.map((opt) => (opt.id === optionId ? { ...opt, label } : opt)) }
          : q,
      ),
    );
  };

  const addOption = (questionId: string) => {
    setDraft((prev) =>
      prev.map((q) => {
        if (q.id !== questionId || q.options.length >= OPTION_IDS.length) return q;
        const nextId = OPTION_IDS.find((id) => !q.options.some((opt) => opt.id === id)) ?? crypto.randomUUID();
        return { ...q, options: [...q.options, { id: nextId, label: "" }] };
      }),
    );
  };

  const removeOption = (questionId: string, optionId: string) => {
    setDraft((prev) =>
      prev.map((q) => {
        if (q.id !== questionId || q.options.length <= 2) return q;
        const options = q.options.filter((opt) => opt.id !== optionId);
        return {
          ...q,
          options,
          correctOptionId: q.correctOptionId === optionId ? options[0]!.id : q.correctOptionId,
        };
      }),
    );
  };

  const save = () => {
    const cleaned = cleanQuestions(draft);
    if (!cleaned) return;
    saveQuizQuestions(activeKey, cleaned);
    appendActivityLog(user?.username ?? "admin", "تعديل أسئلة الاختبار", `${activeMeta.label} — ${cleaned.length} سؤال`);
    toast.success("تم حفظ الأسئلة");
  };

  const reset = () => {
    resetQuizQuestions(activeKey);
    appendActivityLog(user?.username ?? "admin", "استعادة أسئلة الاختبار الافتراضية", activeMeta.label);
    toast.success("تمت استعادة الأسئلة الافتراضية");
  };

  return (
    <div dir="rtl" className="space-y-6 text-slate-900">
      <Card className="border-violet-200 bg-white shadow-sm">
        <CardHeader className="text-right">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="space-y-2">
              <Badge className="w-fit bg-violet-100 text-violet-700 hover:bg-violet-100">Quiz Manager</Badge>
              <CardTitle className="font-display text-2xl">إدارة أسئلة التقديم الإلكتروني</CardTitle>
              <CardDescription className="text-sm leading-relaxed">
                أضف الأسئلة والخيارات وحدد الإجابة الصحيحة لكل اختبار. هذه الأسئلة تظهر للمستخدم عند الإقرار بالقوانين.
              </CardDescription>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button type="button" variant="outline" onClick={reset} className="gap-2">
                <RotateCcw className="h-4 w-4" />
                افتراضي
              </Button>
              <Button type="button" onClick={save} className="gap-2 bg-violet-600 text-white hover:bg-violet-700">
                <Save className="h-4 w-4" />
                حفظ
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Label className="mb-2 block text-right">اختبار الجهة</Label>
          <Select value={activeKey} onValueChange={(v) => setActiveKey(v as QuizContextKey)}>
            <SelectTrigger className="max-w-xl bg-white text-right">
              <SelectValue />
            </SelectTrigger>
            <SelectContent dir="rtl" className="max-h-80">
              {QUIZ_CONTEXTS.map((ctx) => (
                <SelectItem key={ctx.key} value={ctx.key}>
                  {ctx.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="mt-2 text-right text-xs text-slate-500">{activeMeta.description}</p>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button type="button" variant="outline" onClick={() => setDraft((prev) => [...prev, makeQuestion()])} className="gap-2">
          <Plus className="h-4 w-4" />
          إضافة سؤال
        </Button>
      </div>

      <div className="space-y-4">
        {draft.map((q, index) => (
          <Card key={q.id} className="border-slate-200 bg-white shadow-sm">
            <CardHeader className="text-right">
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-100 text-violet-700">
                    <HelpCircle className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <CardTitle className="font-display text-lg">السؤال {index + 1}</CardTitle>
                    <CardDescription>اختر الخيار الصحيح من القائمة أسفل الخيارات.</CardDescription>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  disabled={draft.length <= 1}
                  onClick={() => setDraft((prev) => prev.filter((item) => item.id !== q.id))}
                  className="border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="space-y-2 text-right">
                <Label>نص السؤال</Label>
                <Textarea
                  value={q.question}
                  onChange={(e) => updateQuestion(q.id, { question: e.target.value })}
                  className="min-h-24 bg-white text-right"
                  placeholder="اكتب السؤال هنا..."
                />
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                {q.options.map((opt, optIdx) => {
                  const isCorrect = q.correctOptionId === opt.id;
                  return (
                    <div
                      key={opt.id}
                      className={cn(
                        "rounded-2xl border p-3",
                        isCorrect ? "border-emerald-300 bg-emerald-50" : "border-slate-200 bg-slate-50",
                      )}
                    >
                      <div className="mb-2 flex items-center justify-between gap-2">
                        <span className="font-display text-sm text-slate-600">خيار {String.fromCharCode(65 + optIdx)}</span>
                        {isCorrect ? (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            صحيح
                          </span>
                        ) : null}
                      </div>
                      <div className="flex gap-2">
                        <Input
                          value={opt.label}
                          onChange={(e) => updateOption(q.id, opt.id, e.target.value)}
                          className="bg-white text-right"
                          placeholder="نص الخيار"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          disabled={q.options.length <= 2}
                          onClick={() => removeOption(q.id, opt.id)}
                          className="shrink-0"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex flex-wrap items-end justify-between gap-3 border-t border-slate-100 pt-4">
                <div className="min-w-60 space-y-2 text-right">
                  <Label>الإجابة الصحيحة</Label>
                  <Select value={q.correctOptionId} onValueChange={(v) => updateQuestion(q.id, { correctOptionId: v })}>
                    <SelectTrigger className="bg-white text-right">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent dir="rtl">
                      {q.options.map((opt, optIdx) => (
                        <SelectItem key={opt.id} value={opt.id}>
                          خيار {String.fromCharCode(65 + optIdx)} — {opt.label || "بدون نص"}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button type="button" variant="outline" onClick={() => addOption(q.id)} disabled={q.options.length >= OPTION_IDS.length}>
                  إضافة خيار
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default QuizManagerPage;

import { toast } from "sonner";
import type { QuizQuestion } from "@/data/lawsQuiz";

export const QUIZ_OPTION_IDS = ["a", "b", "c", "d", "e", "f"] as const;

export function makeQuizQuestion(): QuizQuestion {
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

export function cloneQuizQuestion(q: QuizQuestion): QuizQuestion {
  return {
    ...q,
    options: q.options.map((opt) => ({ ...opt })),
  };
}

export function cloneQuizQuestions(list: QuizQuestion[]): QuizQuestion[] {
  return list.map((q) => cloneQuizQuestion(q));
}

export function cleanQuestions(questions: QuizQuestion[]): QuizQuestion[] | null {
  const cleaned = questions.map((q) => {
    const options = q.options
      .map((opt, idx) => ({
        id: opt.id.trim() || QUIZ_OPTION_IDS[idx] || crypto.randomUUID(),
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
    toast.error("كل سؤال يجب أن يحتوي نصاً واضحاً (5 أحرف على الأقل)");
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

export function cleanSingleQuestion(q: QuizQuestion): QuizQuestion | null {
  const cleaned = cleanQuestions([q]);
  return cleaned?.[0] ?? null;
}

import { useEffect, useMemo, useState } from "react";
import { listenStorageSync, writeSyncedLocalStorage } from "@/lib/storageSync";
import { CITIZEN_LAWS_QUIZ, JOB_ROLE_LAWS_QUIZ, type QuizQuestion } from "@/data/lawsQuiz";
import { JOB_ROLE_LAWS, type JobRoleKey } from "@/data/jobRoleLaws";

export type QuizContextKey = "citizen" | JobRoleKey;

export type QuizContextMeta = {
  key: QuizContextKey;
  label: string;
  description: string;
};

export type QuizAttemptSettings = {
  /** عدد الأسئلة التي تُسحب عشوائياً لكل متقدم من بنك الأسئلة */
  questionsPerAttempt: number;
};

const DEFAULT_QUIZ_ATTEMPT_SETTINGS: QuizAttemptSettings = {
  questionsPerAttempt: 10,
};

type PersistedQuizContent = {
  v: 1;
  quizzes: Partial<Record<QuizContextKey, QuizQuestion[]>>;
  settings?: Partial<Record<QuizContextKey, QuizAttemptSettings>>;
};

export const LAWS_QUIZ_STORAGE_KEY = "ic_laws_quiz_content_v1";
/** يُطلق عند تغيّر أسئلة الاختبار في التخزين المحلي — لتحديث الواجهات دون إعادة تحميل الصفحة */
export const LAWS_QUIZ_CONTENT_CHANGED_EVENT = "ic-laws-quiz-content";

export const QUIZ_CONTEXTS: QuizContextMeta[] = [
  {
    key: "citizen",
    label: "تقديم المواطن",
    description: "أسئلة اختبار قوانين المدينة في /apply/citizen",
  },
  ...Object.entries(JOB_ROLE_LAWS).map(([key, value]) => ({
    key: key as JobRoleKey,
    label: value.title,
    description: "أسئلة اختبار تقديم الوظائف",
  })),
];

const DEFAULT_QUIZZES: Record<QuizContextKey, QuizQuestion[]> = {
  citizen: CITIZEN_LAWS_QUIZ,
  ...JOB_ROLE_LAWS_QUIZ,
};

function isQuizQuestion(row: unknown): row is QuizQuestion {
  if (!row || typeof row !== "object") return false;
  const q = row as Partial<QuizQuestion>;
  return (
    typeof q.id === "string" &&
    typeof q.question === "string" &&
    Array.isArray(q.options) &&
    q.options.length >= 2 &&
    q.options.every((opt) => opt && typeof opt.id === "string" && typeof opt.label === "string") &&
    typeof q.correctOptionId === "string" &&
    q.options.some((opt) => opt.id === q.correctOptionId)
  );
}

function normalizeQuestion(row: QuizQuestion): QuizQuestion {
  const options = row.options
    .filter((opt) => opt.id.trim() && opt.label.trim())
    .map((opt) => ({ id: opt.id.trim(), label: opt.label.trim() }));
  const correctOptionId = options.some((opt) => opt.id === row.correctOptionId)
    ? row.correctOptionId
    : (options[0]?.id ?? "");
  return {
    id: row.id.trim() || crypto.randomUUID(),
    question: row.question.trim(),
    options,
    correctOptionId,
    explanation: row.explanation?.trim() || undefined,
  };
}

function normalizeAttemptSettings(raw: unknown): QuizAttemptSettings {
  if (!raw || typeof raw !== "object") return { ...DEFAULT_QUIZ_ATTEMPT_SETTINGS };
  const n = (raw as Partial<QuizAttemptSettings>).questionsPerAttempt;
  const questionsPerAttempt =
    typeof n === "number" && Number.isFinite(n) ? Math.min(50, Math.max(1, Math.floor(n))) : DEFAULT_QUIZ_ATTEMPT_SETTINGS.questionsPerAttempt;
  return { questionsPerAttempt };
}

function hydrateSettings(parsed: Partial<PersistedQuizContent>): Partial<Record<QuizContextKey, QuizAttemptSettings>> {
  const out: Partial<Record<QuizContextKey, QuizAttemptSettings>> = {};
  if (!parsed.settings || typeof parsed.settings !== "object") return out;
  for (const ctx of QUIZ_CONTEXTS) {
    const row = parsed.settings[ctx.key];
    if (row) out[ctx.key] = normalizeAttemptSettings(row);
  }
  return out;
}

function defaultQuizFor(key: QuizContextKey): QuizQuestion[] {
  return DEFAULT_QUIZZES[key] ?? [];
}

export function loadQuizAttemptSettings(key: QuizContextKey): QuizAttemptSettings {
  const stored = loadPersisted().settings?.[key];
  return stored ? normalizeAttemptSettings(stored) : { ...DEFAULT_QUIZ_ATTEMPT_SETTINGS };
}

export function saveQuizAttemptSettings(key: QuizContextKey, settings: QuizAttemptSettings) {
  const current = loadPersisted();
  const next: PersistedQuizContent = {
    ...current,
    settings: {
      ...current.settings,
      [key]: normalizeAttemptSettings(settings),
    },
  };
  writeSyncedLocalStorage(LAWS_QUIZ_STORAGE_KEY, JSON.stringify(next), [LAWS_QUIZ_CONTENT_CHANGED_EVENT]);
}

function loadPersisted(): PersistedQuizContent {
  try {
    const raw = localStorage.getItem(LAWS_QUIZ_STORAGE_KEY);
    if (!raw) return { v: 1, quizzes: {} };
    const parsed = JSON.parse(raw) as PersistedQuizContent;
    if (parsed?.v !== 1 || !parsed.quizzes || typeof parsed.quizzes !== "object") return { v: 1, quizzes: {} };
    const quizzes: Partial<Record<QuizContextKey, QuizQuestion[]>> = {};
    for (const ctx of QUIZ_CONTEXTS) {
      const rows = parsed.quizzes[ctx.key];
      if (!Array.isArray(rows)) continue;
      const normalized = rows.filter(isQuizQuestion).map(normalizeQuestion);
      if (normalized.length > 0) quizzes[ctx.key] = normalized;
    }
    return { v: 1, quizzes, settings: hydrateSettings(parsed) };
  } catch {
    return { v: 1, quizzes: {} };
  }
}

export function loadQuizQuestions(key: QuizContextKey): QuizQuestion[] {
  return loadPersisted().quizzes[key] ?? defaultQuizFor(key);
}

export function loadAllQuizQuestions(): Record<QuizContextKey, QuizQuestion[]> {
  return Object.fromEntries(QUIZ_CONTEXTS.map((ctx) => [ctx.key, loadQuizQuestions(ctx.key)])) as Record<
    QuizContextKey,
    QuizQuestion[]
  >;
}

export function saveQuizQuestions(key: QuizContextKey, questions: QuizQuestion[]) {
  const current = loadPersisted();
  const cleaned = questions.filter(isQuizQuestion).map(normalizeQuestion);
  const next: PersistedQuizContent = {
    ...current,
    v: 1,
    quizzes: {
      ...current.quizzes,
      [key]: cleaned.length > 0 ? cleaned : defaultQuizFor(key),
    },
  };
  writeSyncedLocalStorage(LAWS_QUIZ_STORAGE_KEY, JSON.stringify(next), [LAWS_QUIZ_CONTENT_CHANGED_EVENT]);
}

export function resetQuizQuestions(key: QuizContextKey) {
  const current = loadPersisted();
  const nextQuizzes = { ...current.quizzes };
  delete nextQuizzes[key];
  writeSyncedLocalStorage(
    LAWS_QUIZ_STORAGE_KEY,
    JSON.stringify({ ...current, v: 1, quizzes: nextQuizzes } satisfies PersistedQuizContent),
    [LAWS_QUIZ_CONTENT_CHANGED_EVENT],
  );
}

export function useQuizAttemptSettings(key: QuizContextKey): QuizAttemptSettings {
  const [settings, setSettings] = useState<QuizAttemptSettings>(() => loadQuizAttemptSettings(key));

  useEffect(() => {
    return listenStorageSync(LAWS_QUIZ_STORAGE_KEY, () => setSettings(loadQuizAttemptSettings(key)), [
      LAWS_QUIZ_CONTENT_CHANGED_EVENT,
    ]);
  }, [key]);

  return useMemo(() => settings, [settings]);
}

export function useQuizQuestions(key: QuizContextKey): QuizQuestion[] {
  const [questions, setQuestions] = useState<QuizQuestion[]>(() => loadQuizQuestions(key));

  useEffect(() => {
    return listenStorageSync(LAWS_QUIZ_STORAGE_KEY, () => setQuestions(loadQuizQuestions(key)), [
      LAWS_QUIZ_CONTENT_CHANGED_EVENT,
    ]);
  }, [key]);

  return useMemo(() => questions, [questions]);
}

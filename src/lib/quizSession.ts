import type { QuizQuestion } from "@/data/lawsQuiz";

/** Fisher–Yates — يختار N أسئلة عشوائية من بنك أكبر */
export function pickRandomQuizQuestions(pool: readonly QuizQuestion[], count: number): QuizQuestion[] {
  if (pool.length === 0) return [];
  const n = Math.min(Math.max(1, Math.floor(count)), pool.length);
  const shuffled = [...pool];
  for (let i = shuffled.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j]!, shuffled[i]!];
  }
  return shuffled.slice(0, n);
}

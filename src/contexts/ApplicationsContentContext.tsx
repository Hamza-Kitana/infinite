import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type {
  ApplicationFormSnapshot,
  ApplicationRecord,
  ApplicationStatus,
  LawsQuizAnswer,
  LawsQuizResult,
} from "@/data/publicApplicationTypes";
import { listenStorageSync, writeSyncedLocalStorage } from "@/lib/storageSync";

const STORAGE_KEY = "ic_public_applications_v1";

type Persisted = {
  v: 1;
  applications: ApplicationRecord[];
};

export type SubmitApplicationResult = "ok" | "storage_quota" | "storage_blocked" | "failed";

function loadPersisted(): ApplicationRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const p = JSON.parse(raw) as Persisted;
    if (p?.v === 1 && Array.isArray(p.applications)) {
      return p.applications.filter(
        (a) =>
          a &&
          typeof a === "object" &&
          typeof (a as ApplicationRecord).id === "string" &&
          typeof (a as ApplicationRecord).roleKey === "string" &&
          typeof (a as ApplicationRecord).snapshot === "object",
      ) as ApplicationRecord[];
    }
  } catch {
    /* empty */
  }
  return [];
}

function clampText(s: string, max: number): string {
  if (s.length <= max) return s;
  return s.slice(0, max);
}

function clampQuizAnswer(a: LawsQuizAnswer): LawsQuizAnswer {
  return {
    questionId: clampText(a.questionId, 120),
    question: clampText(a.question, 600),
    selectedOptionId: clampText(a.selectedOptionId, 80),
    selectedOptionLabel: clampText(a.selectedOptionLabel, 600),
    correctOptionId: clampText(a.correctOptionId, 80),
    correctOptionLabel: clampText(a.correctOptionLabel, 600),
    isCorrect: !!a.isCorrect,
  };
}

function clampQuizResult(r: LawsQuizResult | undefined): LawsQuizResult | undefined {
  if (!r) return undefined;
  const answers = Array.isArray(r.answers) ? r.answers.slice(0, 50).map(clampQuizAnswer) : [];
  const askedQuestionIds = Array.isArray(r.askedQuestionIds)
    ? r.askedQuestionIds.slice(0, 50).map((id) => clampText(String(id), 80))
    : undefined;
  const selectedLawSectionIds = Array.isArray(r.selectedLawSectionIds)
    ? r.selectedLawSectionIds.slice(0, 30).map((id) => clampText(String(id), 80))
    : undefined;
  const selectedLawSectionLabels = Array.isArray(r.selectedLawSectionLabels)
    ? r.selectedLawSectionLabels.slice(0, 30).map((label) => clampText(String(label), 120))
    : undefined;
  return {
    passed: !!r.passed,
    correctCount: Math.max(0, Math.min(50, Number.isFinite(r.correctCount) ? Math.floor(r.correctCount) : 0)),
    totalQuestions: Math.max(0, Math.min(50, Number.isFinite(r.totalQuestions) ? Math.floor(r.totalQuestions) : answers.length)),
    attempts: Math.max(1, Math.min(99, Number.isFinite(r.attempts) ? Math.floor(r.attempts) : 1)),
    completedAt: clampText(r.completedAt || new Date().toISOString(), 40),
    answers,
    poolSize:
      typeof r.poolSize === "number" && Number.isFinite(r.poolSize)
        ? Math.max(0, Math.min(200, Math.floor(r.poolSize)))
        : undefined,
    questionsPerAttempt:
      typeof r.questionsPerAttempt === "number" && Number.isFinite(r.questionsPerAttempt)
        ? Math.max(1, Math.min(50, Math.floor(r.questionsPerAttempt)))
        : undefined,
    askedQuestionIds: askedQuestionIds?.length ? askedQuestionIds : undefined,
    selectedLawSectionIds: selectedLawSectionIds?.length ? selectedLawSectionIds : undefined,
    selectedLawSectionLabels: selectedLawSectionLabels?.length ? selectedLawSectionLabels : undefined,
  };
}

/** أقصى حجم لصورة Data URL مرفقة في الطلب — ~ 2.5MB Base64 */
const MAX_AVATAR_DATA_URL_LEN = 2_700_000;

function clampSnapshot(s: ApplicationFormSnapshot): ApplicationFormSnapshot {
  return {
    firstName: clampText(s.firstName, 120),
    lastName: clampText(s.lastName, 120),
    gender: s.gender,
    birthSummaryLine: clampText(s.birthSummaryLine, 160),
    ageSummaryLine: clampText(s.ageSummaryLine, 120),
    countryCode: clampText(s.countryCode, 8),
    discord: clampText(s.discord, 100),
    previousCities: clampText(s.previousCities, 8000),
    experience: clampText(s.experience, 20000),
    lawsAccepted: s.lawsAccepted,
    lawsQuizResult: clampQuizResult(s.lawsQuizResult),
    cityName: s.cityName ? clampText(s.cityName, 120) : undefined,
    bio: s.bio ? clampText(s.bio, 4000) : undefined,
    avatarDataUrl: s.avatarDataUrl
      ? clampText(s.avatarDataUrl, MAX_AVATAR_DATA_URL_LEN)
      : undefined,
    discordId: s.discordId ? clampText(s.discordId, 64) : undefined,
    streamUrl: s.streamUrl ? clampText(s.streamUrl, 500) : undefined,
    streamerCardRole: s.streamerCardRole ? clampText(s.streamerCardRole, 120) : undefined,
  };
}

export const PUBLIC_APPLICATIONS_CHANGED_EVENT = "ic-public-applications-changed";

function writeApplicationsOrThrow(list: ApplicationRecord[]) {
  const data: Persisted = { v: 1, applications: list };
  writeSyncedLocalStorage(STORAGE_KEY, JSON.stringify(data), [PUBLIC_APPLICATIONS_CHANGED_EVENT]);
}

function isQuotaError(e: unknown): boolean {
  return e instanceof DOMException && (e.name === "QuotaExceededError" || e.code === 22);
}

function isBlockedStorageError(e: unknown): boolean {
  return (
    e instanceof DOMException &&
    (e.name === "SecurityError" || e.name === "NotAllowedError" || e.code === 18)
  );
}

type ApplicationsContentValue = {
  applications: ApplicationRecord[];
  /** إضافة طلب جديد من نموذج الموقع */
  submitApplication: (input: {
    roleKey: string;
    targetTitle: string;
    applicantUserId?: string;
    applicantUsername?: string;
    applicantDisplayName?: string;
    snapshot: ApplicationFormSnapshot;
  }) => SubmitApplicationResult;
  /** قرار مراجع (أو سوبر أدمِن) */
  setDecision: (
    id: string,
    status: Exclude<ApplicationStatus, "pending">,
    decidedBy: string,
    note?: string,
  ) => void;
};

const ApplicationsContentContext = createContext<ApplicationsContentValue | null>(null);

export function ApplicationsContentProvider({ children }: { children: ReactNode }) {
  const [applications, setApplications] = useState<ApplicationRecord[]>(() => loadPersisted());

  const persistWithRetry = useCallback((initial: ApplicationRecord[]): SubmitApplicationResult => {
    let cur = initial;
    for (let attempt = 0; attempt < 24; attempt++) {
      try {
        writeApplicationsOrThrow(cur);
        setApplications(cur);
        return "ok";
      } catch (e) {
        if (isBlockedStorageError(e)) return "storage_blocked";
        if (!isQuotaError(e)) return "failed";
        if (cur.length <= 1) return "storage_quota";
        cur = cur.slice(0, Math.max(1, Math.ceil(cur.length / 2)));
      }
    }
    return "storage_quota";
  }, []);

  useEffect(() => {
    return listenStorageSync(STORAGE_KEY, () => setApplications(loadPersisted()), [
      PUBLIC_APPLICATIONS_CHANGED_EVENT,
    ]);
  }, []);

  const submitApplication = useCallback(
    (input: {
      roleKey: string;
      targetTitle: string;
      applicantUserId?: string;
      applicantUsername?: string;
      applicantDisplayName?: string;
      snapshot: ApplicationFormSnapshot;
    }): SubmitApplicationResult => {
      try {
        const rec: ApplicationRecord = {
          id: crypto.randomUUID(),
          roleKey: clampText(input.roleKey, 64),
          targetTitle: clampText(input.targetTitle, 200),
          applicantUserId: input.applicantUserId ? clampText(input.applicantUserId, 120) : undefined,
          applicantUsername: input.applicantUsername ? clampText(input.applicantUsername, 120) : undefined,
          applicantDisplayName: input.applicantDisplayName ? clampText(input.applicantDisplayName, 160) : undefined,
          status: "pending",
          submittedAt: new Date().toISOString(),
          snapshot: clampSnapshot(input.snapshot),
        };
        const prev = loadPersisted();
        return persistWithRetry([rec, ...prev]);
      } catch {
        return "failed";
      }
    },
    [persistWithRetry],
  );

  const setDecision = useCallback(
    (id: string, status: Exclude<ApplicationStatus, "pending">, decidedBy: string, note?: string) => {
      const prev = loadPersisted();
      const next = prev.map((a) =>
        a.id === id
          ? {
              ...a,
              status,
              decidedAt: new Date().toISOString(),
              decidedBy,
              note: note?.trim() || undefined,
            }
          : a,
      );
      persistWithRetry(next);
    },
    [persistWithRetry],
  );

  const value = useMemo<ApplicationsContentValue>(
    () => ({
      applications,
      submitApplication,
      setDecision,
    }),
    [applications, submitApplication, setDecision],
  );

  return (
    <ApplicationsContentContext.Provider value={value}>{children}</ApplicationsContentContext.Provider>
  );
}

export function useApplicationsContent(): ApplicationsContentValue {
  const ctx = useContext(ApplicationsContentContext);
  if (!ctx) throw new Error("useApplicationsContent يجب أن يُستخدم داخل ApplicationsContentProvider");
  return ctx;
}

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { ApplicationFormSnapshot, ApplicationRecord, ApplicationStatus } from "@/data/publicApplicationTypes";

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
  };
}

function writeApplicationsOrThrow(list: ApplicationRecord[]) {
  const data: Persisted = { v: 1, applications: list };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
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
    const onStorage = (e: StorageEvent) => {
      if (e.key !== STORAGE_KEY || e.newValue == null) return;
      try {
        const p = JSON.parse(e.newValue) as Persisted;
        if (p.v === 1 && Array.isArray(p.applications)) setApplications(p.applications);
      } catch {
        /* ignore */
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const submitApplication = useCallback(
    (input: {
      roleKey: string;
      targetTitle: string;
      snapshot: ApplicationFormSnapshot;
    }): SubmitApplicationResult => {
      try {
        const rec: ApplicationRecord = {
          id: crypto.randomUUID(),
          roleKey: clampText(input.roleKey, 64),
          targetTitle: clampText(input.targetTitle, 200),
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

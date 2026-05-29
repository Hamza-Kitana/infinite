import { useEffect, useMemo, useState } from "react";
import { listenStorageSync, writeSyncedLocalStorage } from "@/lib/storageSync";
import { JOB_ROLE_LAWS, type JobRoleKey, type JobRoleLawSet } from "@/data/jobRoleLaws";

export const JOB_ROLE_LAWS_STORAGE_KEY = "ic_job_role_laws_content_v2";
export const JOB_ROLE_LAWS_CONTENT_CHANGED_EVENT = "ic-job-role-laws-content";

type Persisted = {
  v: 2;
  laws: Partial<Record<JobRoleKey, JobRoleLawSet>>;
};

function isLawSet(row: unknown): row is JobRoleLawSet {
  if (!row || typeof row !== "object") return false;
  const r = row as Partial<JobRoleLawSet>;
  return (
    typeof r.title === "string" &&
    typeof r.subtitle === "string" &&
    Array.isArray(r.rules) &&
    r.rules.every((line) => typeof line === "string")
  );
}

function normalizeLawSet(row: JobRoleLawSet): JobRoleLawSet {
  return {
    title: row.title.trim(),
    subtitle: row.subtitle.trim(),
    rules: row.rules.map((line) => line.trim()).filter(Boolean),
  };
}

function loadPersisted(): Persisted {
  try {
    const raw = localStorage.getItem(JOB_ROLE_LAWS_STORAGE_KEY);
    if (!raw) return { v: 2, laws: {} };
    const parsed = JSON.parse(raw) as Persisted;
    if (parsed?.v !== 2 || !parsed.laws || typeof parsed.laws !== "object") return { v: 2, laws: {} };
    const laws: Partial<Record<JobRoleKey, JobRoleLawSet>> = {};
    for (const key of Object.keys(JOB_ROLE_LAWS) as JobRoleKey[]) {
      const row = parsed.laws[key];
      if (!isLawSet(row)) continue;
      const normalized = normalizeLawSet(row);
      if (normalized.title.length > 0) laws[key] = normalized;
    }
    return { v: 2, laws };
  } catch {
    return { v: 2, laws: {} };
  }
}

export function loadJobRoleLawSet(key: JobRoleKey): JobRoleLawSet {
  const persisted = loadPersisted().laws[key];
  if (persisted) return { ...persisted, rules: [...persisted.rules] };
  const defaults = JOB_ROLE_LAWS[key];
  return { ...defaults, rules: [...defaults.rules] };
}

export function saveJobRoleLawSet(key: JobRoleKey, lawSet: JobRoleLawSet) {
  const current = loadPersisted();
  const normalized = normalizeLawSet(lawSet);
  const next: Persisted = {
    v: 2,
    laws: { ...current.laws, [key]: normalized },
  };
  writeSyncedLocalStorage(JOB_ROLE_LAWS_STORAGE_KEY, JSON.stringify(next), [
    JOB_ROLE_LAWS_CONTENT_CHANGED_EVENT,
  ]);
}

export function useJobRoleLawSet(key: JobRoleKey | ""): JobRoleLawSet | null {
  const [lawSet, setLawSet] = useState<JobRoleLawSet | null>(() =>
    key ? loadJobRoleLawSet(key) : null,
  );

  useEffect(() => {
    if (!key) {
      setLawSet(null);
      return;
    }
    return listenStorageSync(JOB_ROLE_LAWS_STORAGE_KEY, () => setLawSet(loadJobRoleLawSet(key)), [
      JOB_ROLE_LAWS_CONTENT_CHANGED_EVENT,
    ]);
  }, [key]);

  return useMemo(() => lawSet, [lawSet]);
}

import { useEffect, useMemo, useState } from "react";
import {
  INSTITUTION_BRANCH_IDS,
  type InstitutionBranchId,
} from "@/data/institutionBranches";

/**
 * إدارة حالة "إغلاق التقديم" لكل فرع مؤسسي.
 * - تُخزَّن في localStorage تحت مفتاح ic_applications_closure_v1
 * - تُعرض على واجهات المستخدم بشكل فوري عبر حدث ic-applications-closure
 */

const STORAGE_KEY = "ic_applications_closure_v1";
const EVENT_NAME = "ic-applications-closure";

type Persisted = {
  v: 1;
  closed: Record<InstitutionBranchId, boolean>;
  /** ملاحظة اختيارية تُعرض للمستخدم تشرح سبب الإغلاق */
  notes: Partial<Record<InstitutionBranchId, string>>;
};

function defaultState(): Persisted {
  return {
    v: 1,
    closed: Object.fromEntries(
      INSTITUTION_BRANCH_IDS.map((id) => [id, false]),
    ) as Record<InstitutionBranchId, boolean>,
    notes: {},
  };
}

function hydrate(raw: unknown): Persisted {
  const base = defaultState();
  if (!raw || typeof raw !== "object") return base;
  const p = raw as Partial<Persisted>;
  return {
    v: 1,
    closed: { ...base.closed, ...(p.closed ?? {}) },
    notes: { ...(p.notes ?? {}) },
  };
}

export function loadApplicationsClosure(): Persisted {
  if (typeof window === "undefined") return defaultState();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState();
    return hydrate(JSON.parse(raw));
  } catch {
    return defaultState();
  }
}

function save(next: Persisted) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    /* تجاهل تجاوز الحصة — الحالة ستُعاد قراءتها لاحقاً من القرص */
  }
  window.dispatchEvent(new CustomEvent(EVENT_NAME));
}

export function setBranchApplicationsClosed(
  branchId: InstitutionBranchId,
  closed: boolean,
) {
  const current = loadApplicationsClosure();
  save({
    ...current,
    closed: { ...current.closed, [branchId]: closed },
  });
}

export function setBranchApplicationsNote(
  branchId: InstitutionBranchId,
  note: string,
) {
  const current = loadApplicationsClosure();
  const trimmed = note.trim();
  const nextNotes: Persisted["notes"] = { ...current.notes };
  if (trimmed) nextNotes[branchId] = trimmed;
  else delete nextNotes[branchId];
  save({ ...current, notes: nextNotes });
}

export function isBranchApplicationsClosed(
  branchId: InstitutionBranchId,
): boolean {
  return loadApplicationsClosure().closed[branchId] === true;
}

export function getBranchApplicationsNote(
  branchId: InstitutionBranchId,
): string | undefined {
  return loadApplicationsClosure().notes[branchId];
}

export function useApplicationsClosure() {
  const [state, setState] = useState<Persisted>(() => loadApplicationsClosure());

  useEffect(() => {
    const sync = () => setState(loadApplicationsClosure());
    window.addEventListener("storage", sync);
    window.addEventListener(EVENT_NAME, sync as EventListener);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener(EVENT_NAME, sync as EventListener);
    };
  }, []);

  return useMemo(() => state, [state]);
}

/**
 * يربط مفاتيح الأدوار العامة (المستخدمة في `/apply/:role` و `/jobs/apply/:role`)
 * إلى معرّف الفرع المؤسسي الذي يُغلق/يُفتح من لوحة الإدارة.
 * الأدوار التي لا ترتبط بمؤسسة (citizen, streamers, vip) تُعيد null.
 */
export function branchIdFromApplicationRoleKey(
  roleKey: string,
): InstitutionBranchId | null {
  switch (roleKey) {
    case "ems":
      return "health";
    case "police":
      return "interior_police";
    case "interior_sheriff":
      return "interior_sheriff";
    case "interior_cia":
      return "interior_cia";
    case "interior_marines":
      return "interior_marines";
    case "oversight":
      return "oversight";
    case "lawyer":
    case "justice":
      return "justice_lawyers";
    case "developer":
      return "developer";
    default:
      return null;
  }
}

export function isApplicationRoleClosed(roleKey: string): boolean {
  const id = branchIdFromApplicationRoleKey(roleKey);
  if (!id) return false;
  return isBranchApplicationsClosed(id);
}

export function getApplicationRoleClosureNote(
  roleKey: string,
): string | undefined {
  const id = branchIdFromApplicationRoleKey(roleKey);
  if (!id) return undefined;
  return getBranchApplicationsNote(id);
}

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { InstitutionBranchId } from "@/data/institutionBranches";
import type { InstitutionRosterData } from "@/data/institutionRosters";
import {
  defaultInstitutionRostersPersisted,
  type InstitutionRostersPersisted,
} from "@/data/institutionRostersDefaultState";

const STORAGE_KEY = "ic_institution_rosters_v1";

function hydrate(partial: unknown): InstitutionRostersPersisted {
  const base = defaultInstitutionRostersPersisted();
  if (
    partial &&
    typeof partial === "object" &&
    (partial as InstitutionRostersPersisted).v === 1 &&
    typeof (partial as InstitutionRostersPersisted).rosters === "object" &&
    (partial as InstitutionRostersPersisted).rosters !== null
  ) {
    return { v: 1, rosters: { ...base.rosters, ...(partial as InstitutionRostersPersisted).rosters } };
  }
  return base;
}

function loadPersisted(): InstitutionRostersPersisted {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultInstitutionRostersPersisted();
    return hydrate(JSON.parse(raw));
  } catch {
    return defaultInstitutionRostersPersisted();
  }
}

function savePersisted(data: InstitutionRostersPersisted) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

type InstitutionRostersContentValue = {
  getBranchRoster: (id: InstitutionBranchId) => InstitutionRosterData;
  setBranchRoster: (id: InstitutionBranchId, roster: InstitutionRosterData) => void;
  resetBranchToDefault: (id: InstitutionBranchId) => void;
  resetAllToDefaults: () => void;
};

const InstitutionRostersContentContext = createContext<InstitutionRostersContentValue | null>(null);

export function InstitutionRostersContentProvider({ children }: { children: ReactNode }) {
  const [persisted, setPersisted] = useState<InstitutionRostersPersisted>(() => loadPersisted());

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key !== STORAGE_KEY || e.newValue == null) return;
      try {
        setPersisted(hydrate(JSON.parse(e.newValue)));
      } catch {
        /* ignore */
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const getBranchRoster = useCallback(
    (id: InstitutionBranchId) => persisted.rosters[id],
    [persisted.rosters],
  );

  const setBranchRoster = useCallback((id: InstitutionBranchId, roster: InstitutionRosterData) => {
    setPersisted((prev) => {
      const next: InstitutionRostersPersisted = {
        v: 1,
        rosters: { ...prev.rosters, [id]: JSON.parse(JSON.stringify(roster)) as InstitutionRosterData },
      };
      savePersisted(next);
      return next;
    });
  }, []);

  const resetBranchToDefault = useCallback((id: InstitutionBranchId) => {
    setPersisted((prev) => {
      const def = defaultInstitutionRostersPersisted().rosters[id];
      const next: InstitutionRostersPersisted = {
        v: 1,
        rosters: { ...prev.rosters, [id]: JSON.parse(JSON.stringify(def)) as InstitutionRosterData },
      };
      savePersisted(next);
      return next;
    });
  }, []);

  const resetAllToDefaults = useCallback(() => {
    const next = defaultInstitutionRostersPersisted();
    savePersisted(next);
    setPersisted(next);
  }, []);

  const value = useMemo<InstitutionRostersContentValue>(
    () => ({
      getBranchRoster,
      setBranchRoster,
      resetBranchToDefault,
      resetAllToDefaults,
    }),
    [getBranchRoster, setBranchRoster, resetBranchToDefault, resetAllToDefaults],
  );

  return (
    <InstitutionRostersContentContext.Provider value={value}>{children}</InstitutionRostersContentContext.Provider>
  );
}

export function useInstitutionRostersContent(): InstitutionRostersContentValue {
  const ctx = useContext(InstitutionRostersContentContext);
  if (!ctx) throw new Error("useInstitutionRostersContent يجب أن يُستخدم داخل InstitutionRostersContentProvider");
  return ctx;
}

/** للصفحات العامة — يعيد طاقم الفرع الحالي من التخزين */
export function useInstitutionRoster(branchId: InstitutionBranchId): InstitutionRosterData {
  return useInstitutionRostersContent().getBranchRoster(branchId);
}

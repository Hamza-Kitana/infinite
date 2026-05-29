import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { defaultGangsPersisted } from "@/data/gangsDefaultState";
import { listenStorageSync, writeSyncedLocalStorage } from "@/lib/storageSync";
import type { GangCard, GangsPersisted } from "@/types/gangsSchema";

const STORAGE_KEY = "ic_gangs_v2";

function loadPersisted(): GangsPersisted {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultGangsPersisted();
    const p = JSON.parse(raw) as GangsPersisted;
    if (p?.v === 2 && Array.isArray(p.gangs)) {
      return p;
    }
  } catch {
    /* fallback */
  }
  return defaultGangsPersisted();
}

function savePersisted(data: GangsPersisted) {
  writeSyncedLocalStorage(STORAGE_KEY, JSON.stringify(data));
}

type GangsContentValue = {
  gangs: GangCard[];
  resetToDefaults: () => void;
  reorder: (fromIndex: number, toIndex: number) => void;
  add: (gang: GangCard) => void;
  update: (id: string, patch: Partial<GangCard>) => void;
  remove: (id: string) => void;
};

const GangsContentContext = createContext<GangsContentValue | null>(null);

export function GangsContentProvider({ children }: { children: ReactNode }) {
  const [persisted, setPersisted] = useState<GangsPersisted>(() => loadPersisted());

  useEffect(() => {
    return listenStorageSync(STORAGE_KEY, () => setPersisted(loadPersisted()));
  }, []);

  const resetToDefaults = useCallback(() => {
    const next = defaultGangsPersisted();
    savePersisted(next);
    setPersisted(next);
  }, []);

  const reorder = useCallback((fromIndex: number, toIndex: number) => {
    setPersisted((prev) => {
      const gangs = [...prev.gangs];
      const [moved] = gangs.splice(fromIndex, 1);
      gangs.splice(toIndex, 0, moved);
      const next = { ...prev, gangs };
      savePersisted(next);
      return next;
    });
  }, []);

  const add = useCallback((gang: GangCard) => {
    setPersisted((prev) => {
      const next = { ...prev, gangs: [...prev.gangs, gang] };
      savePersisted(next);
      return next;
    });
  }, []);

  const update = useCallback((id: string, patch: Partial<GangCard>) => {
    setPersisted((prev) => {
      const gangs = prev.gangs.map((g) => (g.id === id ? { ...g, ...patch, id } : g));
      const next = { ...prev, gangs };
      savePersisted(next);
      return next;
    });
  }, []);

  const remove = useCallback((id: string) => {
    setPersisted((prev) => {
      const next = { ...prev, gangs: prev.gangs.filter((g) => g.id !== id) };
      savePersisted(next);
      return next;
    });
  }, []);

  const value = useMemo<GangsContentValue>(
    () => ({
      gangs: persisted.gangs,
      resetToDefaults,
      reorder,
      add,
      update,
      remove,
    }),
    [persisted.gangs, resetToDefaults, reorder, add, update, remove],
  );

  return <GangsContentContext.Provider value={value}>{children}</GangsContentContext.Provider>;
}

export function useGangsContent(): GangsContentValue {
  const ctx = useContext(GangsContentContext);
  if (!ctx) throw new Error("useGangsContent يجب أن يُستخدم داخل GangsContentProvider");
  return ctx;
}

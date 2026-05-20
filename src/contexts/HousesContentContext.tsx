import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { defaultHousesPersisted, type HousesPersisted } from "@/data/housesDefaultState";
import type { HouseCatalogItem } from "@/data/housesCatalog";
import { listenStorageSync, writeSyncedLocalStorage } from "@/lib/storageSync";

const STORAGE_KEY = "ic_houses_v1";

function loadPersisted(): HousesPersisted {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultHousesPersisted();
    const p = JSON.parse(raw) as HousesPersisted;
    if (p?.v === 1 && Array.isArray(p.houses)) return p;
  } catch {
    /* fallback */
  }
  return defaultHousesPersisted();
}

function savePersisted(data: HousesPersisted) {
  writeSyncedLocalStorage(STORAGE_KEY, JSON.stringify(data));
}

type HousesContentValue = {
  houses: HouseCatalogItem[];
  resetToDefaults: () => void;
  reorder: (fromIndex: number, toIndex: number) => void;
  add: (item: HouseCatalogItem) => void;
  update: (id: string, patch: Partial<HouseCatalogItem>) => void;
  remove: (id: string) => void;
};

const HousesContentContext = createContext<HousesContentValue | null>(null);

export function HousesContentProvider({ children }: { children: ReactNode }) {
  const [persisted, setPersisted] = useState<HousesPersisted>(() => loadPersisted());

  useEffect(() => {
    return listenStorageSync(STORAGE_KEY, () => setPersisted(loadPersisted()));
  }, []);

  const resetToDefaults = useCallback(() => {
    const next = defaultHousesPersisted();
    savePersisted(next);
    setPersisted(next);
  }, []);

  const reorder = useCallback((fromIndex: number, toIndex: number) => {
    setPersisted((prev) => {
      const houses = [...prev.houses];
      const [moved] = houses.splice(fromIndex, 1);
      houses.splice(toIndex, 0, moved);
      const next = { ...prev, houses };
      savePersisted(next);
      return next;
    });
  }, []);

  const add = useCallback((item: HouseCatalogItem) => {
    setPersisted((prev) => {
      const next = { ...prev, houses: [...prev.houses, item] };
      savePersisted(next);
      return next;
    });
  }, []);

  const update = useCallback((id: string, patch: Partial<HouseCatalogItem>) => {
    setPersisted((prev) => {
      const houses = prev.houses.map((h) => (h.id === id ? { ...h, ...patch, id } : h));
      const next = { ...prev, houses };
      savePersisted(next);
      return next;
    });
  }, []);

  const remove = useCallback((id: string) => {
    setPersisted((prev) => {
      const next = { ...prev, houses: prev.houses.filter((h) => h.id !== id) };
      savePersisted(next);
      return next;
    });
  }, []);

  const value = useMemo<HousesContentValue>(
    () => ({ houses: persisted.houses, resetToDefaults, reorder, add, update, remove }),
    [persisted.houses, resetToDefaults, reorder, add, update, remove],
  );

  return <HousesContentContext.Provider value={value}>{children}</HousesContentContext.Provider>;
}

export function useHousesContent(): HousesContentValue {
  const ctx = useContext(HousesContentContext);
  if (!ctx) throw new Error("useHousesContent يجب أن يُستخدم داخل HousesContentProvider");
  return ctx;
}

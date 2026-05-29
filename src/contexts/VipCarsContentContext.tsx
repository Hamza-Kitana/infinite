import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { defaultVipCarsPersisted, type VipCarsPersisted } from "@/data/vipCarsDefaultState";
import type { VipCatalogCar } from "@/data/vipCarsCatalog";
import { listenStorageSync, writeSyncedLocalStorage } from "@/lib/storageSync";

const STORAGE_KEY = "ic_vip_cars_v2";

function loadPersisted(): VipCarsPersisted {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultVipCarsPersisted();
    const p = JSON.parse(raw) as VipCarsPersisted;
    if (p?.v === 2 && Array.isArray(p.cars)) {
      return p;
    }
  } catch {
    /* fallback */
  }
  return defaultVipCarsPersisted();
}

function savePersisted(data: VipCarsPersisted) {
  writeSyncedLocalStorage(STORAGE_KEY, JSON.stringify(data));
}

type VipCarsContentValue = {
  cars: VipCatalogCar[];
  resetToDefaults: () => void;
  reorder: (fromIndex: number, toIndex: number) => void;
  add: (car: VipCatalogCar) => void;
  update: (id: string, patch: Partial<VipCatalogCar>) => void;
  remove: (id: string) => void;
};

const VipCarsContentContext = createContext<VipCarsContentValue | null>(null);

export function VipCarsContentProvider({ children }: { children: ReactNode }) {
  const [persisted, setPersisted] = useState<VipCarsPersisted>(() => loadPersisted());

  useEffect(() => {
    return listenStorageSync(STORAGE_KEY, () => setPersisted(loadPersisted()));
  }, []);

  const resetToDefaults = useCallback(() => {
    const next = defaultVipCarsPersisted();
    savePersisted(next);
    setPersisted(next);
  }, []);

  const reorder = useCallback((fromIndex: number, toIndex: number) => {
    setPersisted((prev) => {
      const cars = [...prev.cars];
      const [moved] = cars.splice(fromIndex, 1);
      cars.splice(toIndex, 0, moved);
      const next = { ...prev, cars };
      savePersisted(next);
      return next;
    });
  }, []);

  const add = useCallback((car: VipCatalogCar) => {
    setPersisted((prev) => {
      const next = { ...prev, cars: [...prev.cars, car] };
      savePersisted(next);
      return next;
    });
  }, []);

  const update = useCallback((id: string, patch: Partial<VipCatalogCar>) => {
    setPersisted((prev) => {
      const cars = prev.cars.map((c) => (c.id === id ? { ...c, ...patch, id } : c));
      const next = { ...prev, cars };
      savePersisted(next);
      return next;
    });
  }, []);

  const remove = useCallback((id: string) => {
    setPersisted((prev) => {
      const next = { ...prev, cars: prev.cars.filter((c) => c.id !== id) };
      savePersisted(next);
      return next;
    });
  }, []);

  const value = useMemo<VipCarsContentValue>(
    () => ({
      cars: persisted.cars,
      resetToDefaults,
      reorder,
      add,
      update,
      remove,
    }),
    [persisted.cars, resetToDefaults, reorder, add, update, remove],
  );

  return <VipCarsContentContext.Provider value={value}>{children}</VipCarsContentContext.Provider>;
}

export function useVipCarsContent(): VipCarsContentValue {
  const ctx = useContext(VipCarsContentContext);
  if (!ctx) throw new Error("useVipCarsContent يجب أن يُستخدم داخل VipCarsContentProvider");
  return ctx;
}

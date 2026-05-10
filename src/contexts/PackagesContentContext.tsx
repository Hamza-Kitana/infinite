import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { defaultPackagesPersisted, type PackagesPersisted } from "@/data/packagesDefaultState";
import type { PackageCatalogItem } from "@/data/packagesCatalog";

const STORAGE_KEY = "ic_packages_v1";

function loadPersisted(): PackagesPersisted {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultPackagesPersisted();
    const p = JSON.parse(raw) as PackagesPersisted;
    if (p?.v === 1 && Array.isArray(p.packages)) return p;
  } catch {
    /* fallback */
  }
  return defaultPackagesPersisted();
}

function savePersisted(data: PackagesPersisted) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

type PackagesContentValue = {
  packages: PackageCatalogItem[];
  resetToDefaults: () => void;
  reorder: (fromIndex: number, toIndex: number) => void;
  add: (item: PackageCatalogItem) => void;
  update: (id: string, patch: Partial<PackageCatalogItem>) => void;
  remove: (id: string) => void;
};

const PackagesContentContext = createContext<PackagesContentValue | null>(null);

export function PackagesContentProvider({ children }: { children: ReactNode }) {
  const [persisted, setPersisted] = useState<PackagesPersisted>(() => loadPersisted());

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key !== STORAGE_KEY || e.newValue == null) return;
      try {
        const p = JSON.parse(e.newValue) as PackagesPersisted;
        if (p.v === 1 && Array.isArray(p.packages)) setPersisted(p);
      } catch {
        /* ignore */
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const resetToDefaults = useCallback(() => {
    const next = defaultPackagesPersisted();
    savePersisted(next);
    setPersisted(next);
  }, []);

  const reorder = useCallback((fromIndex: number, toIndex: number) => {
    setPersisted((prev) => {
      const packages = [...prev.packages];
      const [moved] = packages.splice(fromIndex, 1);
      packages.splice(toIndex, 0, moved);
      const next = { ...prev, packages };
      savePersisted(next);
      return next;
    });
  }, []);

  const add = useCallback((item: PackageCatalogItem) => {
    setPersisted((prev) => {
      const next = { ...prev, packages: [...prev.packages, item] };
      savePersisted(next);
      return next;
    });
  }, []);

  const update = useCallback((id: string, patch: Partial<PackageCatalogItem>) => {
    setPersisted((prev) => {
      const packages = prev.packages.map((p) => (p.id === id ? { ...p, ...patch, id } : p));
      const next = { ...prev, packages };
      savePersisted(next);
      return next;
    });
  }, []);

  const remove = useCallback((id: string) => {
    setPersisted((prev) => {
      const next = { ...prev, packages: prev.packages.filter((p) => p.id !== id) };
      savePersisted(next);
      return next;
    });
  }, []);

  const value = useMemo<PackagesContentValue>(
    () => ({ packages: persisted.packages, resetToDefaults, reorder, add, update, remove }),
    [persisted.packages, resetToDefaults, reorder, add, update, remove],
  );

  return <PackagesContentContext.Provider value={value}>{children}</PackagesContentContext.Provider>;
}

export function usePackagesContent(): PackagesContentValue {
  const ctx = useContext(PackagesContentContext);
  if (!ctx) throw new Error("usePackagesContent يجب أن يُستخدم داخل PackagesContentProvider");
  return ctx;
}

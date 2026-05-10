import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { defaultInvestmentsPersisted, type InvestmentsPersisted } from "@/data/investmentsDefaultState";
import type { InvestmentCatalogItem } from "@/data/investmentsCatalog";

const STORAGE_KEY = "ic_investments_v1";

function loadPersisted(): InvestmentsPersisted {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultInvestmentsPersisted();
    const p = JSON.parse(raw) as InvestmentsPersisted;
    if (p?.v === 1 && Array.isArray(p.investments)) return p;
  } catch {
    /* fallback */
  }
  return defaultInvestmentsPersisted();
}

function savePersisted(data: InvestmentsPersisted) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

type InvestmentsContentValue = {
  investments: InvestmentCatalogItem[];
  resetToDefaults: () => void;
  reorder: (fromIndex: number, toIndex: number) => void;
  add: (item: InvestmentCatalogItem) => void;
  update: (id: string, patch: Partial<InvestmentCatalogItem>) => void;
  remove: (id: string) => void;
};

const InvestmentsContentContext = createContext<InvestmentsContentValue | null>(null);

export function InvestmentsContentProvider({ children }: { children: ReactNode }) {
  const [persisted, setPersisted] = useState<InvestmentsPersisted>(() => loadPersisted());

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key !== STORAGE_KEY || e.newValue == null) return;
      try {
        const p = JSON.parse(e.newValue) as InvestmentsPersisted;
        if (p.v === 1 && Array.isArray(p.investments)) setPersisted(p);
      } catch {
        /* ignore */
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const resetToDefaults = useCallback(() => {
    const next = defaultInvestmentsPersisted();
    savePersisted(next);
    setPersisted(next);
  }, []);

  const reorder = useCallback((fromIndex: number, toIndex: number) => {
    setPersisted((prev) => {
      const investments = [...prev.investments];
      const [moved] = investments.splice(fromIndex, 1);
      investments.splice(toIndex, 0, moved);
      const next = { ...prev, investments };
      savePersisted(next);
      return next;
    });
  }, []);

  const add = useCallback((item: InvestmentCatalogItem) => {
    setPersisted((prev) => {
      const next = { ...prev, investments: [...prev.investments, item] };
      savePersisted(next);
      return next;
    });
  }, []);

  const update = useCallback((id: string, patch: Partial<InvestmentCatalogItem>) => {
    setPersisted((prev) => {
      const investments = prev.investments.map((i) => (i.id === id ? { ...i, ...patch, id } : i));
      const next = { ...prev, investments };
      savePersisted(next);
      return next;
    });
  }, []);

  const remove = useCallback((id: string) => {
    setPersisted((prev) => {
      const next = { ...prev, investments: prev.investments.filter((i) => i.id !== id) };
      savePersisted(next);
      return next;
    });
  }, []);

  const value = useMemo<InvestmentsContentValue>(
    () => ({ investments: persisted.investments, resetToDefaults, reorder, add, update, remove }),
    [persisted.investments, resetToDefaults, reorder, add, update, remove],
  );

  return (
    <InvestmentsContentContext.Provider value={value}>{children}</InvestmentsContentContext.Provider>
  );
}

export function useInvestmentsContent(): InvestmentsContentValue {
  const ctx = useContext(InvestmentsContentContext);
  if (!ctx) throw new Error("useInvestmentsContent يجب أن يُستخدم داخل InvestmentsContentProvider");
  return ctx;
}

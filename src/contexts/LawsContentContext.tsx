import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { defaultLawsPersisted } from "@/data/lawsDefaultState";
import { schedulePersistSuccessToast } from "@/lib/persistSuccessToast";
import { listenStorageSync, writeSyncedLocalStorage } from "@/lib/storageSync";
import type {
  LawRuleItem,
  LawTabSection,
  LawTabSectionPenalties,
  LawTabSectionRules,
  LawsPersisted,
  PenaltiesBlock,
  RuleVariant,
} from "@/types/lawsSchema";

const STORAGE_KEY = "ic_laws_v1";

function loadPersisted(): LawsPersisted {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultLawsPersisted();
    const p = JSON.parse(raw) as LawsPersisted;
    if (p?.v === 1 && Array.isArray(p.sections) && p.sections.length > 0) {
      return p;
    }
  } catch {
    /* fallback */
  }
  return defaultLawsPersisted();
}

const LAWS_SAVE_TOAST_ID = "ic-laws-autosave";

function savePersisted(data: LawsPersisted) {
  writeSyncedLocalStorage(STORAGE_KEY, JSON.stringify(data));
  schedulePersistSuccessToast("تم حفظ القوانين", LAWS_SAVE_TOAST_ID, 750);
}

export function renumberRuleItems(rules: LawRuleItem[]): LawRuleItem[] {
  return rules.map((r, i) => ({ ...r, id: i + 1 }));
}

type LawsContentValue = {
  sections: LawTabSection[];
  resetToDefaults: () => void;
  reorderSections: (fromIndex: number, toIndex: number) => void;
  addRulesSection: (input: {
    label: string;
    short: string;
    subtitle: string;
    icon: string;
    variant: RuleVariant;
  }) => string;
  addPenaltiesSection: (input: {
    label: string;
    short: string;
    subtitle: string;
    icon: string;
    variant: RuleVariant;
  }) => string;
  deleteSection: (id: string) => void;
  updateSectionMeta: (
    id: string,
    patch: Partial<
      Pick<
        LawTabSectionRules,
        "label" | "short" | "subtitle" | "icon" | "variant" | "hidden"
      >
    >,
  ) => void;
  setRules: (sectionId: string, rules: LawRuleItem[]) => void;
  addRule: (sectionId: string, rule: Omit<LawRuleItem, "id">) => void;
  updateRule: (sectionId: string, ruleId: number, patch: Partial<Omit<LawRuleItem, "id">>) => void;
  deleteRule: (sectionId: string, ruleId: number) => void;
  reorderRules: (sectionId: string, fromIndex: number, toIndex: number) => void;
  updatePenaltiesBlock: (sectionId: string, fn: (b: PenaltiesBlock) => PenaltiesBlock) => void;
};

const LawsContentContext = createContext<LawsContentValue | null>(null);

export function LawsContentProvider({ children }: { children: ReactNode }) {
  const [persisted, setPersisted] = useState<LawsPersisted>(() => loadPersisted());

  const commit = useCallback((next: LawsPersisted) => {
    savePersisted(next);
    setPersisted(next);
  }, []);

  useEffect(() => {
    return listenStorageSync(STORAGE_KEY, () => setPersisted(loadPersisted()));
  }, []);

  const resetToDefaults = useCallback(() => {
    commit(defaultLawsPersisted());
  }, [commit]);

  const reorderSections = useCallback(
    (fromIndex: number, toIndex: number) => {
      setPersisted((prev) => {
        const sections = [...prev.sections];
        const [moved] = sections.splice(fromIndex, 1);
        sections.splice(toIndex, 0, moved);
        const next = { ...prev, sections };
        savePersisted(next);
        return next;
      });
    },
    [],
  );

  const addRulesSection = useCallback(
    (input: {
      label: string;
      short: string;
      subtitle: string;
      icon: string;
      variant: RuleVariant;
    }) => {
      const id = crypto.randomUUID();
      const section: LawTabSectionRules = {
        kind: "rules",
        id,
        label: input.label,
        short: input.short,
        subtitle: input.subtitle,
        icon: input.icon,
        variant: input.variant,
        rules: [],
      };
      setPersisted((prev) => {
        const next = { ...prev, sections: [...prev.sections, section] };
        savePersisted(next);
        return next;
      });
      return id;
    },
    [],
  );

  const addPenaltiesSection = useCallback(
    (input: {
      label: string;
      short: string;
      subtitle: string;
      icon: string;
      variant: RuleVariant;
    }) => {
      const id = crypto.randomUUID();
      const emptyBlock: PenaltiesBlock = {
        warningLevels: [],
        specificPenalties: [],
        robberyPeopleRules: [],
        directPoliceUnitsRules: [],
        safeZones: [],
      };
      const section: LawTabSectionPenalties = {
        kind: "penalties",
        id,
        label: input.label,
        short: input.short,
        subtitle: input.subtitle,
        icon: input.icon,
        variant: input.variant,
        penalties: emptyBlock,
      };
      setPersisted((prev) => {
        const next = { ...prev, sections: [...prev.sections, section] };
        savePersisted(next);
        return next;
      });
      return id;
    },
    [],
  );

  const deleteSection = useCallback((id: string) => {
    setPersisted((prev) => {
      const next = { ...prev, sections: prev.sections.filter((s) => s.id !== id) };
      savePersisted(next);
      return next;
    });
  }, []);

  const updateSectionMeta = useCallback(
    (
      id: string,
      patch: Partial<Pick<LawTabSectionRules, "label" | "short" | "subtitle" | "icon" | "variant" | "hidden">>,
    ) => {
      setPersisted((prev) => {
        const sections = prev.sections.map((s) => {
          if (s.id !== id) return s;
          return { ...s, ...patch } as LawTabSection;
        });
        const next = { ...prev, sections };
        savePersisted(next);
        return next;
      });
    },
    [],
  );

  const setRules = useCallback((sectionId: string, rules: LawRuleItem[]) => {
    setPersisted((prev) => {
      const sections = prev.sections.map((s) => {
        if (s.id !== sectionId || s.kind !== "rules") return s;
        return { ...s, rules: renumberRuleItems(rules) };
      });
      const next = { ...prev, sections };
      savePersisted(next);
      return next;
    });
  }, []);

  const addRule = useCallback((sectionId: string, rule: Omit<LawRuleItem, "id">) => {
    setPersisted((prev) => {
      const sections = prev.sections.map((s) => {
        if (s.id !== sectionId || s.kind !== "rules") return s;
        const nextRules = renumberRuleItems([...s.rules, { ...rule, id: s.rules.length + 1 }]);
        return { ...s, rules: nextRules };
      });
      const next = { ...prev, sections };
      savePersisted(next);
      return next;
    });
  }, []);

  const updateRule = useCallback(
    (sectionId: string, ruleId: number, patch: Partial<Omit<LawRuleItem, "id">>) => {
      setPersisted((prev) => {
        const sections = prev.sections.map((s) => {
          if (s.id !== sectionId || s.kind !== "rules") return s;
          const rules = s.rules.map((r) => (r.id === ruleId ? { ...r, ...patch, id: ruleId } : r));
          return { ...s, rules };
        });
        const next = { ...prev, sections };
        savePersisted(next);
        return next;
      });
    },
    [],
  );

  const deleteRule = useCallback((sectionId: string, ruleId: number) => {
    setPersisted((prev) => {
      const sections = prev.sections.map((s) => {
        if (s.id !== sectionId || s.kind !== "rules") return s;
        const filtered = s.rules.filter((r) => r.id !== ruleId);
        return { ...s, rules: renumberRuleItems(filtered) };
      });
      const next = { ...prev, sections };
      savePersisted(next);
      return next;
    });
  }, []);

  const reorderRules = useCallback((sectionId: string, fromIndex: number, toIndex: number) => {
    setPersisted((prev) => {
      const sections = prev.sections.map((s) => {
        if (s.id !== sectionId || s.kind !== "rules") return s;
        const rules = [...s.rules];
        const [m] = rules.splice(fromIndex, 1);
        rules.splice(toIndex, 0, m);
        return { ...s, rules: renumberRuleItems(rules) };
      });
      const next = { ...prev, sections };
      savePersisted(next);
      return next;
    });
  }, []);

  const updatePenaltiesBlock = useCallback(
    (sectionId: string, fn: (b: PenaltiesBlock) => PenaltiesBlock) => {
      setPersisted((prev) => {
        const sections = prev.sections.map((s) => {
          if (s.id !== sectionId || s.kind !== "penalties") return s;
          return { ...s, penalties: fn(s.penalties) };
        });
        const next = { ...prev, sections };
        savePersisted(next);
        return next;
      });
    },
    [],
  );

  const value = useMemo<LawsContentValue>(
    () => ({
      sections: persisted.sections,
      resetToDefaults,
      reorderSections,
      addRulesSection,
      addPenaltiesSection,
      deleteSection,
      updateSectionMeta,
      setRules,
      addRule,
      updateRule,
      deleteRule,
      reorderRules,
      updatePenaltiesBlock,
    }),
    [
      persisted.sections,
      resetToDefaults,
      reorderSections,
      addRulesSection,
      addPenaltiesSection,
      deleteSection,
      updateSectionMeta,
      setRules,
      addRule,
      updateRule,
      deleteRule,
      reorderRules,
      updatePenaltiesBlock,
    ],
  );

  return <LawsContentContext.Provider value={value}>{children}</LawsContentContext.Provider>;
}

export function useLawsContent(): LawsContentValue {
  const ctx = useContext(LawsContentContext);
  if (!ctx) throw new Error("useLawsContent يجب أن يُستخدم داخل LawsContentProvider");
  return ctx;
}

import type { LawTabSection, LawsPersisted } from "@/types/lawsSchema";

/** لا أقسام افتراضية — تُضاف من محرر القوانين في لوحة الإدارة */
export function buildDefaultLawsSections(): LawTabSection[] {
  return [];
}

export function defaultLawsPersisted(): LawsPersisted {
  return { v: 2, sections: buildDefaultLawsSections() };
}

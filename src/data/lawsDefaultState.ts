import {
  generalRules,
  crimeRules,
  organizationalRules,
  crimeNegotiationRules,
  warningLevels,
  specificPenalties,
  robberyPeopleRules,
  directPoliceUnitsRules,
  safeZones,
  storeRules,
} from "@/data/justiceRules";
import type { LawTabSection, LawsPersisted } from "@/types/lawsSchema";

/** الحالة الافتراضية المستوردة من البيانات الثابتة الحالية */
export function buildDefaultLawsSections(): LawTabSection[] {
  return [
    {
      kind: "rules",
      id: "general",
      label: "العامة",
      short: "عامة",
      subtitle: "القواعد الأساسية التي تنطبق على جميع اللاعبين دون استثناء.",
      icon: "Scale",
      variant: "primary",
      rules: generalRules.map((r) => ({ ...r })),
    },
    {
      kind: "rules",
      id: "crime",
      label: "الإجرام",
      short: "إجرام",
      subtitle: "الأنشطة الإجرامية، العصابات، والتفاصيل الحساسة للسيناريوهات.",
      icon: "Shield",
      variant: "secondary",
      rules: crimeRules.map((r) => ({ ...r })),
    },
    {
      kind: "rules",
      id: "org",
      label: "التنظيمية",
      short: "تنظيم",
      subtitle: "الأسماء، الوثائق، العصابات، والقطاعات — لتجربة منظمة وعادلة.",
      icon: "Building2",
      variant: "accent",
      rules: organizationalRules.map((r) => ({ ...r })),
    },
    {
      kind: "rules",
      id: "negotiation",
      label: "الجرائم والتفاوض",
      short: "تفاوض",
      subtitle: "العداوات، النصب، التلويت، والتفاوض بين الأطراف وفق أصول الرول بلاي.",
      icon: "MessageSquareWarning",
      variant: "magenta",
      rules: crimeNegotiationRules.map((r) => ({ ...r })),
    },
    {
      kind: "penalties",
      id: "penalties",
      label: "العقوبات",
      short: "عقوبات",
      subtitle: "الإنذارات، الغرامات الزمنية، جداول السرقات، والمناطق الآمنة.",
      icon: "Gavel",
      variant: "primary",
      penalties: {
        warningLevels: warningLevels.map((w) => ({ ...w })),
        specificPenalties: specificPenalties.map((p) => ({ ...p })),
        robberyPeopleRules: robberyPeopleRules.map((r) => ({ ...r })),
        directPoliceUnitsRules: directPoliceUnitsRules.map((r) => ({ ...r })),
        safeZones: safeZones.map((z) => ({ ...z })),
      },
    },
    {
      kind: "rules",
      id: "store",
      label: "المتجر",
      short: "متجر",
      subtitle: "شروط وأحكام المشتريات — التزامك بالشراء يعني موافقتك الكاملة.",
      icon: "Store",
      variant: "primary",
      rules: storeRules.map((r) => ({ ...r })),
    },
  ];
}

export function defaultLawsPersisted(): LawsPersisted {
  return { v: 1, sections: buildDefaultLawsSections() };
}

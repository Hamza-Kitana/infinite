/** نوع بطاقة القانون في الشبكة */
export type LawRuleItem = {
  id: number;
  title: string;
  description: string;
  hidden?: boolean;
};

export type RuleVariant = "primary" | "secondary" | "accent" | "magenta";

/** محتوى تبويب العقوبات (الإنذارات، الجداول، المناطق الآمنة…) */
export type PenaltiesBlock = {
  warningLevels: { id: number; title: string; duration: string }[];
  specificPenalties: { id: number; title: string; penalty: string }[];
  robberyPeopleRules: { label: string; value: string }[];
  directPoliceUnitsRules: { label: string; value: string }[];
  safeZones: { icon: string; label: string }[];
};

export type LawTabSectionRules = {
  kind: "rules";
  id: string;
  label: string;
  short: string;
  subtitle: string;
  icon: string;
  variant: RuleVariant;
  hidden?: boolean;
  rules: LawRuleItem[];
};

export type LawTabSectionPenalties = {
  kind: "penalties";
  id: string;
  label: string;
  short: string;
  subtitle: string;
  icon: string;
  variant: RuleVariant;
  hidden?: boolean;
  penalties: PenaltiesBlock;
};

export type LawTabSection = LawTabSectionRules | LawTabSectionPenalties;

export type LawsPersisted = {
  v: 2;
  sections: LawTabSection[];
};

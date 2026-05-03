/** دول عربية للاختيار في نماذج التقديم — القيمة المخزنة رمز ISO قصير */

export const DEFAULT_ARAB_COUNTRY_CODE = "JO";

export const arabCountries = [
  { code: "JO", label: "الأردن" },
  { code: "SA", label: "السعودية" },
  { code: "AE", label: "الإمارات العربية المتحدة" },
  { code: "KW", label: "الكويت" },
  { code: "QA", label: "قطر" },
  { code: "BH", label: "البحرين" },
  { code: "OM", label: "عُمان" },
  { code: "YE", label: "اليمن" },
  { code: "IQ", label: "العراق" },
  { code: "SY", label: "سوريا" },
  { code: "LB", label: "لبنان" },
  { code: "PS", label: "فلسطين" },
  { code: "EG", label: "مصر" },
  { code: "LY", label: "ليبيا" },
  { code: "TN", label: "تونس" },
  { code: "DZ", label: "الجزائر" },
  { code: "MA", label: "المغرب" },
  { code: "SD", label: "السودان" },
  { code: "SO", label: "الصومال" },
  { code: "DJ", label: "جيبوتي" },
  { code: "MR", label: "موريتانيا" },
  { code: "KM", label: "جزر القمر" },
] as const;

const labelByCode = new Map(arabCountries.map((c) => [c.code, c.label]));

export function getArabCountryLabel(code: string): string {
  return labelByCode.get(code as (typeof arabCountries)[number]["code"]) ?? code;
}

export function isArabCountryCode(code: string): boolean {
  return labelByCode.has(code as (typeof arabCountries)[number]["code"]);
}

/** تحليل يوم/شهر/سنة كنص إلى Date، أو null إن كان غيرًا صالحًا */
export function parseBirthDateParts(year: string, month: string, day: string): Date | null {
  if (!year?.trim() || !month?.trim() || !day?.trim()) return null;
  const y = Number.parseInt(year, 10);
  const m = Number.parseInt(month, 10);
  const d = Number.parseInt(day, 10);
  if (Number.isNaN(y) || Number.isNaN(m) || Number.isNaN(d)) return null;
  const birth = new Date(y, m - 1, d);
  if (birth.getFullYear() !== y || birth.getMonth() !== m - 1 || birth.getDate() !== d) return null;
  return birth;
}

/** العمر الكامل بالسنوات اعتبارًا من اليوم */
export function getFullYearsSinceBirth(birth: Date, ref = new Date()): number {
  let years = ref.getFullYear() - birth.getFullYear();
  const monthDiff = ref.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && ref.getDate() < birth.getDate())) {
    years -= 1;
  }
  return years;
}

export const ARABIC_MONTHS = [
  "يناير",
  "فبراير",
  "مارس",
  "أبريل",
  "مايو",
  "يونيو",
  "يوليو",
  "أغسطس",
  "سبتمبر",
  "أكتوبر",
  "نوفمبر",
  "ديسمبر",
] as const;

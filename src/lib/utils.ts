import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** جزء اسم بالعربي فقط: حروف عربية + مسافات، بدون إنجليزي أو أرقام */
export function isValidArabicNamePart(value: string): boolean {
  const t = value.trim();
  if (t.length < 2) return false;
  if (!/[\u0600-\u06FF]/.test(t)) return false;
  return /^[\u0600-\u06FF\s\u0640]+$/.test(t);
}

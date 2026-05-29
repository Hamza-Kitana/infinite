/** كتالوج عقارات (بيوت/شقق/فيلات/محلات) — نفس النمط المستخدم لسيارات VIP */

export type HouseSpecs = {
  /** عدد غرف النوم (للسكني) أو القسم (للتجاري) */
  bedrooms: number;
  bathrooms: number;
  /** عدد المرائب — استخدم 0 إذا لا يوجد */
  garages: number;
  /** المساحة كنص: "320 م²" مثلاً */
  area: string;
};

export type HouseCatalogItem = {
  id: string;
  name: string;
  nameEn?: string;
  thumbnailUrl: string;
  galleryUrls: string[];
  /** سعر تقديري بالدولار (شراء حقيقي خارج اللعبة) */
  priceUsd: number;
  description: string;
  /** حي المدينة */
  district: string;
  /** نوع العقار للعرض في البطاقة */
  category: "villa" | "apartment" | "shop" | "office" | "house";
  /** هل العقار مؤثث بالكامل */
  furnished: boolean;
  taken: boolean;
  hidden?: boolean;
  specs: HouseSpecs;
};

/** فارغ — يُعبّأ من لوحة إدارة المتجر → العقارات */
export const housesCatalog: HouseCatalogItem[] = [];

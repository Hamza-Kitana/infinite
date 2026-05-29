/** كتالوج سيارات VIP */

/** قيم الأشرطة من 0 إلى 100 — تمثيل داخل الواجهة فقط */
export type VipCarPerformanceBars = {
  speed: number;
  acceleration: number;
  handling: number;
  braking: number;
};

export type VipCatalogCar = {
  id: string;
  name: string;
  nameEn?: string;
  thumbnailUrl: string;
  galleryUrls: string[];
  /** سعر شراء حقيقي بالدولار (خارج اللعبة، تقريباً 50–300$) */
  priceUsd: number;
  description: string;
  modifiable: boolean;
  taken: boolean;
  /** مخفية من العرض في الموقع العام */
  hidden?: boolean;
  stats: {
    /** السرعة القصوى المعروضة */
    topSpeed: string;
    /** التسارع تقريباً 0→100 */
    acceleration: string;
    performance: VipCarPerformanceBars;
  };
};

/** فارغ — يُعبّأ من لوحة إدارة المتجر → سيارات VIP */
export const vipCarsCatalog: VipCatalogCar[] = [];

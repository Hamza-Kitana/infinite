/** كتالوج بكجات (حزم/Subscription packs) للمتجر */

export type PackageCatalogItem = {
  id: string;
  name: string;
  nameEn?: string;
  thumbnailUrl: string;
  galleryUrls: string[];
  /** سعر البكج (USD) */
  priceUsd: number;
  description: string;
  /** قائمة بالمزايا/المحتويات بالنقاط (سطر لكل ميزة) */
  benefits: string[];
  /** المدة كنص: "30 يوم" / "موسم" / "دائم" */
  duration: string;
  /** بطاقة مميّزة في العرض */
  featured?: boolean;
  taken: boolean;
  hidden?: boolean;
};

/** فارغ — يُعبّأ من لوحة إدارة المتجر → البكجات */
export const packagesCatalog: PackageCatalogItem[] = [];

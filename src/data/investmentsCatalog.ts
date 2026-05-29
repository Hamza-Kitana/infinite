/** كتالوج فرص الاستثمار في المدينة (مطاعم/كازينو/محطات وقود/إلخ) */

export type InvestmentCatalogItem = {
  id: string;
  name: string;
  nameEn?: string;
  thumbnailUrl: string;
  galleryUrls: string[];
  /** السعر/المساهمة المطلوبة (USD) */
  priceUsd: number;
  description: string;
  /** قطاع الاستثمار: مطاعم، ترفيه، بنية تحتية، إلخ */
  sector: string;
  /** عائد متوقع كنص للعرض (تمثيلي داخل الرول بلاي) */
  expectedReturn: string;
  /** موقع/حي العرض */
  location: string;
  /** نقاط الميزات الرئيسية */
  highlights: string[];
  /** يقبل الشراكة (تقسيم نسب) */
  partnersAllowed: boolean;
  taken: boolean;
  hidden?: boolean;
};

/** فارغ — يُعبّأ من لوحة إدارة المتجر → الاستثمارات */
export const investmentsCatalog: InvestmentCatalogItem[] = [];

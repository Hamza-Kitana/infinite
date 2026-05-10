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

const img = (photoPath: string, w: number) =>
  `https://images.unsplash.com/${photoPath}?auto=format&fit=crop&w=${w}&q=88`;

export const investmentsCatalog: InvestmentCatalogItem[] = [
  {
    id: "downtown-restaurant",
    name: "مطعم وسط المدينة",
    nameEn: "Downtown Restaurant",
    thumbnailUrl: img("photo-1517248135467-4c7edcad34c4", 900),
    galleryUrls: [img("photo-1559339352-11d035aa65de", 1400), img("photo-1466978913421-dad2ebd01d17", 1400)],
    priceUsd: 350,
    description:
      "مطعم راقٍ في وسط المدينة — قائمة طعام متنوعة، ديكور عصري، وموقع حيوي. مثالي لمن يبي يدخل قطاع الخدمات داخل الرول بلاي.",
    sector: "خدمات وضيافة",
    expectedReturn: "5–10% من الإيرادات شهرياً (تمثيلي)",
    location: "وسط المدينة",
    highlights: [
      "قائمة طعام متنوعة قابلة للتحديث",
      "موظفون داخل القصة (طباخ، نادل، مدير)",
      "صالة استقبال للمناسبات والاحتفالات",
    ],
    partnersAllowed: true,
    taken: false,
  },
  {
    id: "vinewood-casino",
    name: "كازينو فاينوود",
    nameEn: "Vinewood Casino",
    thumbnailUrl: img("photo-1606503825008-909a67e63c3d", 900),
    galleryUrls: [img("photo-1606503825008-909a67e63c3d", 1400), img("photo-1517649763962-0c623066013b", 1400)],
    priceUsd: 980,
    description:
      "منشأة ترفيه فاخرة بطابع فاينوود — يتطلب موافقة إدارية مفصّلة وقواعد لعب صارمة لضمان تجربة آمنة وعادلة لجميع اللاعبين.",
    sector: "ترفيه",
    expectedReturn: "حسب نسبة المشاركة في الأرباح (تمثيلي)",
    location: "فاينوود",
    highlights: [
      "صالات ألعاب متعددة ضمن قواعد السيرفر",
      "حدث VIP أسبوعي داخل القصة",
      "أمن وحراسات احترافية كرول بلاي",
    ],
    partnersAllowed: true,
    taken: false,
  },
  {
    id: "highway-fuel-station",
    name: "محطة وقود الطريق السريع",
    nameEn: "Highway Fuel Station",
    thumbnailUrl: img("photo-1568605115459-4b731184f961", 900),
    galleryUrls: [img("photo-1568605115459-4b731184f961", 1400)],
    priceUsd: 220,
    description:
      "محطة وقود ضمن شبكة الطرق الرئيسية — تدعم تنقّل اللاعبين والأحداث، ويمكن ربطها بعقود توريد داخل الرول بلاي.",
    sector: "بنية تحتية",
    expectedReturn: "إيراد ثابت من ضخّ الوقود (تمثيلي)",
    location: "الطريق السريع شمالاً",
    highlights: [
      "موقع استراتيجي مع كثافة مرور",
      "ربط بعقود توريد رول بلاي",
      "متجر صغير للتموين السريع",
    ],
    partnersAllowed: false,
    taken: false,
  },
];

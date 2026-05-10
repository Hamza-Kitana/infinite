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

const img = (photoPath: string, w: number) =>
  `https://images.unsplash.com/${photoPath}?auto=format&fit=crop&w=${w}&q=88`;

export const housesCatalog: HouseCatalogItem[] = [
  {
    id: "vinewood-villa-01",
    name: "فيلا فاينوود الذهبية",
    nameEn: "Vinewood Golden Villa",
    thumbnailUrl: img("photo-1613490493576-7fde63acd811", 900),
    galleryUrls: [
      img("photo-1600596542815-ffad4c1539a9", 1400),
      img("photo-1505691938895-1758d7feb511", 1400),
      img("photo-1600585154340-be6161a56a0c", 1400),
    ],
    priceUsd: 280,
    description:
      "فيلا فاخرة على أطراف فاينوود — مسبح خاص، حديقة واسعة، ومرآبين لاستيعاب مركبات VIP. مثالية للشخصيات ذات الحضور القوي والمواكب الإدارية.",
    district: "فاينوود هيلز",
    category: "villa",
    furnished: true,
    taken: false,
    specs: { bedrooms: 5, bathrooms: 4, garages: 2, area: "640 م²" },
  },
  {
    id: "downtown-loft",
    name: "شقة وسط المدينة",
    nameEn: "Downtown Loft",
    thumbnailUrl: img("photo-1502672260266-1c1ef2d93688", 900),
    galleryUrls: [
      img("photo-1493809842364-78817add7ffb", 1400),
      img("photo-1505691938895-1758d7feb511", 1400),
      img("photo-1556909114-f6e7ad7d3136", 1400),
    ],
    priceUsd: 110,
    description:
      "لوفت أنيق قرب المراكز التجارية — أسلوب حياة حضري، إطلالة على الكورنيش، ومناسب للأدوار المهنية والإدارية في القصة.",
    district: "وسط المدينة",
    category: "apartment",
    furnished: true,
    taken: false,
    specs: { bedrooms: 2, bathrooms: 2, garages: 1, area: "150 م²" },
  },
  {
    id: "harbor-shop",
    name: "محل تجاري — الميناء",
    nameEn: "Harbor Shop",
    thumbnailUrl: img("photo-1582407947304-fd86f028f716", 900),
    galleryUrls: [
      img("photo-1582543364296-3a0d4c4b91ad", 1400),
      img("photo-1604014237800-1c9102c219da", 1400),
    ],
    priceUsd: 95,
    description:
      "واجهة تجارية مطلّة على الميناء — مساحة عرض ممتازة لمشروعك في الرول بلاي بعد الموافقات الإدارية.",
    district: "الميناء",
    category: "shop",
    furnished: false,
    taken: false,
    specs: { bedrooms: 0, bathrooms: 1, garages: 0, area: "85 م²" },
  },
];

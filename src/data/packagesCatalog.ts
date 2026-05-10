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

const img = (photoPath: string, w: number) =>
  `https://images.unsplash.com/${photoPath}?auto=format&fit=crop&w=${w}&q=88`;

export const packagesCatalog: PackageCatalogItem[] = [
  {
    id: "starter-pack",
    name: "بكج البداية",
    nameEn: "Starter Pack",
    thumbnailUrl: img("photo-1607082348824-0a96f2a4b9da", 900),
    galleryUrls: [img("photo-1607082348824-0a96f2a4b9da", 1400), img("photo-1607082349562-2a8a2f4f7234", 1400)],
    priceUsd: 25,
    description:
      "نقطة دخول لطيفة لتجربة المدينة بسرعة — حساب نشط، رصيد رمزي، وأولوية متوسطة في طوابير الدخول.",
    benefits: [
      "تفعيل الحساب فوراً بعد الدفع",
      "رصيد بداية رمزي داخل اللعبة",
      "أولوية في طابور الدخول للسيرفر",
    ],
    duration: "30 يوم",
    taken: false,
  },
  {
    id: "vip-elite",
    name: "بكج VIP النخبة",
    nameEn: "VIP Elite",
    thumbnailUrl: img("photo-1542273917363-3b1817f69a2d", 900),
    galleryUrls: [img("photo-1542273917363-3b1817f69a2d", 1400), img("photo-1605902711622-cfb43c4437b5", 1400)],
    priceUsd: 120,
    description:
      "الباقة الأكثر شموليّة — تشمل أولوية قصوى، شعار VIP في الدسكورد، ومرونة على المركبات المسجّلة.",
    benefits: [
      "أولوية قصوى في طابور الدخول",
      "وسم VIP داخل ديسكورد المدينة",
      "خصم 10% على شراء سيارات VIP",
      "دعم فني سريع داخل الديسكورد",
    ],
    duration: "موسم كامل",
    featured: true,
    taken: false,
  },
  {
    id: "seasonal-rp",
    name: "بكج الرول بلاي الموسمي",
    nameEn: "Seasonal RP Pack",
    thumbnailUrl: img("photo-1551649001-7a2482d98d05", 900),
    galleryUrls: [img("photo-1551649001-7a2482d98d05", 1400)],
    priceUsd: 45,
    description:
      "بكج موسمي يضيف وميزات تتوافق مع تيمة الموسم الحالي — تجهيزات قصة، ملابس مخصصة، ونقاط بداية.",
    benefits: [
      "تجهيزات قصة لشخصيتك حسب الموسم",
      "إكسسوارات وملابس مخصصة",
      "نقاط بداية موسمية",
    ],
    duration: "حتى نهاية الموسم",
    taken: false,
  },
];

/** كتالوج سيارات VIP — صور من Unsplash (سيارات حقيقية). استبدل الروابط بصوركم عند الحاجة */

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

/** ضبط عرض الصورة لسرعة التحميل */
const img = (photoPath: string, w: number) =>
  `https://images.unsplash.com/${photoPath}?auto=format&fit=crop&w=${w}&q=88`;

export const vipCarsCatalog: VipCatalogCar[] = [
  {
    id: "obey-9f",
    name: "أوبي 9F معدّلة",
    nameEn: "Obey 9F Custom",
    thumbnailUrl: img("photo-1494976388531-d1058494cdd8", 900),
    galleryUrls: [
      img("photo-1583121274602-3e2820c69888", 1400),
      img("photo-1525609004556-c46c7d6dd023", 1400),
      img("photo-1552519507-da3b142c6e3d", 1400),
      img("photo-1489828524919-f88007dab067", 1400),
    ],
    priceUsd: 85,
    description:
      "كوبيه رياضية أنيقة للمدينة والمهام السريعة — توازن ممتاز بين التحكم والثبات. مناسبة إذا تبي حضور لافت من غير مبالغة في المشهد.",
    modifiable: true,
    taken: false,
    stats: {
      topSpeed: "~295 كم/س",
      acceleration: "~3.8 ث · 0→100",
      performance: { speed: 82, acceleration: 78, handling: 88, braking: 80 },
    },
  },
  {
    id: "comet-sr",
    name: "كوميت أس آر",
    nameEn: "Comet SR",
    thumbnailUrl: img("photo-1503376780353-7e6692767b70", 900),
    galleryUrls: [
      img("photo-1544636331-e34879c36260", 1400),
      img("photo-1617531653332-bd46c24f2068", 1400),
      img("photo-1618843479313-40f8afb4b4d8", 1400),
    ],
    priceUsd: 220,
    description:
      "روح حلبات وهيكل خفيف: تنعطف بثقة وتنفع للأحداث والسباقات ضمن التنظيم الرسمي للسيرفر.",
    modifiable: true,
    taken: true,
    stats: {
      topSpeed: "~318 كم/س",
      acceleration: "~3.2 ث · 0→100",
      performance: { speed: 91, acceleration: 92, handling: 93, braking: 86 },
    },
  },
  {
    id: "buffalo-stx",
    name: "بوفالو STX",
    nameEn: "Buffalo STX",
    thumbnailUrl: img("photo-1563720360172-67b8f3dce741", 900),
    galleryUrls: [
      img("photo-1549923746-c502d488b3db", 1400),
      img("photo-1619767885128-eb68257952ed", 1400),
      img("photo-1590362893948-e725cb5fffaf", 1400),
      img("photo-1492144534655-ae79c964c9d7", 1400),
    ],
    priceUsd: 145,
    description:
      "سيدان فاخرة بصندوق واسع وراحة في الركوب — مثالية للمواكب، الإدارة، والشخصيات اللي تحتاج هيبة وهدوء في الرول بلاي.",
    modifiable: false,
    taken: false,
    stats: {
      topSpeed: "~268 كم/س",
      acceleration: "~4.5 ث · 0→100",
      performance: { speed: 71, acceleration: 68, handling: 72, braking: 76 },
    },
  },
  {
    id: "sultan-rs",
    name: "سلطان آر إس كلاسيك",
    nameEn: "Sultan RS Classic",
    thumbnailUrl: img("photo-1544636331-e34879c36260", 900),
    galleryUrls: [
      img("photo-1555215695-3004980ad54e", 1400),
      img("photo-1533473359331-0135ef1b58af", 1400),
      img("photo-1549923746-c502d488b3db", 1400),
    ],
    priceUsd: 75,
    description:
      "لمحة كلاسيك من عالم التعديل والشوارع — رشاقة ودفع يخليك تتحكم بالسيناريو بدون ثقل على المشهد.",
    modifiable: true,
    taken: false,
    stats: {
      topSpeed: "~288 كم/س",
      acceleration: "~3.9 ث · 0→100",
      performance: { speed: 79, acceleration: 83, handling: 87, braking: 73 },
    },
  },
  {
    id: "jester-rr",
    name: "جيستر آر آر",
    nameEn: "Jester RR",
    thumbnailUrl: img("photo-1583121274602-3e2820c69888", 900),
    galleryUrls: [
      img("photo-1606664515524-ed2f786a0bd6", 1400),
      img("photo-1617531653332-bd46c24f2068", 1400),
      img("photo-1580273916550-e323be2ae537", 1400),
      img("photo-1489828524919-f88007dab067", 1400),
    ],
    priceUsd: 175,
    description:
      "خطوط عصرية ولون حضور قوي — مناسبة للاستعراض والمحتوى البصري ضمن حدود اللائحة.",
    modifiable: true,
    taken: false,
    stats: {
      topSpeed: "~305 كم/س",
      acceleration: "~3.5 ث · 0→100",
      performance: { speed: 86, acceleration: 84, handling: 85, braking: 79 },
    },
  },
  {
    id: "rebla-gts",
    name: "ريبلا GTS",
    nameEn: "Rebla GTS",
    thumbnailUrl: img("photo-1519641471654-76ce0107ad1b", 900),
    galleryUrls: [
      img("photo-1533473359331-0135ef1b58af", 1400),
      img("photo-1590362893948-e725cb5fffaf", 1400),
      img("photo-1549317661-bd32c8ce0db2", 1400),
    ],
    priceUsd: 265,
    description:
      "دفع رباعي فاخر ومساحة للعائلة أو المجموعات — رحلات بين المناطق براحة ووضوح في الهوية.",
    modifiable: false,
    taken: true,
    stats: {
      topSpeed: "~242 كم/س",
      acceleration: "~5.2 ث · 0→100",
      performance: { speed: 65, acceleration: 60, handling: 74, braking: 77 },
    },
  },
  {
    id: "schafter-v12",
    name: "شافتر V12",
    nameEn: "Schafter V12",
    thumbnailUrl: img("photo-1549923746-c502d488b3db", 900),
    galleryUrls: [
      img("photo-1563720360172-67b8f3dce741", 1400),
      img("photo-1492144534655-ae79c964c9d7", 1400),
      img("photo-1619767885128-eb68257952ed", 1400),
      img("photo-1549317661-bd32c8ce0db2", 1400),
    ],
    priceUsd: 120,
    description:
      "سيدان راقية بإحساس «الوقار» — محامين، إداريين، أدوار تحتاج حضور هادئ ومُحترم في المشهد.",
    modifiable: false,
    taken: false,
    stats: {
      topSpeed: "~275 كم/س",
      acceleration: "~4.1 ث · 0→100",
      performance: { speed: 76, acceleration: 72, handling: 71, braking: 81 },
    },
  },
  {
    id: "paragon-r",
    name: "باراغون R",
    nameEn: "Paragon R",
    thumbnailUrl: img("photo-1552519507-da3b142c6e3d", 900),
    galleryUrls: [
      img("photo-1525609004556-c46c7d6dd023", 1400),
      img("photo-1494976388531-d1058494cdd8", 1400),
      img("photo-1583121274602-3e2820c69888", 1400),
    ],
    priceUsd: 300,
    description:
      "جراند تورينغ بفخامة عالية — سهرات، مناسبات، وطلعات ليلية داخل المدينة مع قيد معقول على المطاردات الطويلة.",
    modifiable: true,
    taken: false,
    stats: {
      topSpeed: "~312 كم/س",
      acceleration: "~3.6 ث · 0→100",
      performance: { speed: 88, acceleration: 83, handling: 86, braking: 84 },
    },
  },
  {
    id: "komoda-gt",
    name: "كومودا GT",
    nameEn: "Komoda GT",
    thumbnailUrl: img("photo-1525609004556-c46c7d6dd023", 900),
    galleryUrls: [
      img("photo-1555215695-3004980ad54e", 1400),
      img("photo-1618843479313-40f8afb4b4d8", 1400),
      img("photo-1606664515524-ed2f786a0bd6", 1400),
      img("photo-1489828524919-f88007dab067", 1400),
    ],
    priceUsd: 95,
    description:
      "كوبيه متوسطة السعر — نقطة دخول مناسبة لباقة VIP إذا تبي أداء لطيف وترقية لاحقة لاحقاً.",
    modifiable: true,
    taken: false,
    stats: {
      topSpeed: "~298 كم/س",
      acceleration: "~3.9 ث · 0→100",
      performance: { speed: 81, acceleration: 77, handling: 84, braking: 78 },
    },
  },
  {
    id: "torrence-lx",
    name: "تورنس LX",
    nameEn: "Torrence LX",
    thumbnailUrl: img("photo-1619767885128-eb68257952ed", 900),
    galleryUrls: [
      img("photo-1549923746-c502d488b3db", 1400),
      img("photo-1492144534655-ae79c964c9d7", 1400),
      img("photo-1590362893948-e725cb5fffaf", 1400),
    ],
    priceUsd: 50,
    description:
      "سيدان عملية وسعر دخول لطيف — مناسبة أول تجربة شراء خارج اللعبة قبل ما يفعل المطوّر المركبة على حسابك.",
    modifiable: false,
    taken: false,
    stats: {
      topSpeed: "~228 كم/س",
      acceleration: "~6.8 ث · 0→100",
      performance: { speed: 58, acceleration: 55, handling: 68, braking: 70 },
    },
  },
];

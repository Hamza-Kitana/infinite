import type { ChromaGridItem } from "@/components/ChromaGrid";
import type { RosterPerson } from "@/components/InstitutionRoster";

export type InstitutionRosterData = {
  leader: RosterPerson;
  deputy: RosterPerson;
  members: ChromaGridItem[];
};

const g =
  (from: string, to = "#000") =>
  (deg: number) =>
    `linear-gradient(${deg}deg, ${from}, ${to})`;

/** صور مبدئية متميزة لكل عضو (pravatar) */
const face = (n: number) => `https://i.pravatar.cc/400?img=${n}`;

export const emsRoster: InstitutionRosterData = {
  leader: {
    name: "الوزير سيراف",
    title: "وزير الصحة",
    image: "https://images.unsplash.com/photo-1612276529731-4b21494e6d71?auto=format&fit=crop&w=500&q=80",
    tagline: "المسؤول الأول عن ملف الصحة والإسعاف وجودة الاستجابة الطبية في المدينة.",
    bio: "يشرف على استراتيجية الطوارئ والمستشفيات الميدانية، ويتابع جاهزية طاقم الإسعاف والمعدات والمركبات مع تقارير أداء دورية أمام الإدارة العليا.",
    highlights: [
      "إقرار السياسات الصحية ولائحة الإسعاف وتمويل الوحدات الطبية.",
      "التنسيق مع غرفة عمليات الإسعاف والمستشفيات في الحالات الحرجة.",
      "تمثيل قطاع الصحة أمام المؤسسات الحكومية الأخرى في المدينة.",
    ],
  },
  deputy: {
    name: "المسعف ريسكيو",
    title: "نائب وزير الصحة",
    image: "https://images.unsplash.com/photo-1584515933487-779824d29309?auto=format&fit=crop&w=500&q=80",
    tagline: "الإشراف التنفيذي على الإسعاف الميداني وبروتوكولات الطوارئ.",
    bio: "يدعم وزير الصحة في الإنعاش والحالات الحرجة؛ يخلفه في غيابه ويرفع تقارير الأداء وتدريب المسعفين ومتابعة زمن الاستجابة في كل منطقة.",
    highlights: [
      "تطبيق بروتوكولات الإنعاش والإسعاف الأولي على مستوى المدينة.",
      "إشراف ورش الطوارئ للطاقم الجديد ومتابعة المناوبات الليلية.",
      "رفع تقارير مجدولة لوزير الصحة حول جودة الخدمة الميدانية.",
    ],
  },
  members: [
    { image: face(12), title: "المسعف ميدك", subtitle: "مسعف ميداني — استجابة سريعة", borderColor: "#10B981", gradient: g("#059669")(145) },
    { image: face(47), title: "المسعفة هيلث", subtitle: "أخصائية إسعاف — فرز الحالات", borderColor: "#34D399", gradient: g("#047857")(165) },
    { image: face(33), title: "المسعف بولس", subtitle: "إخلاء وإنعاش — وحدة ألفا", borderColor: "#6EE7B7", gradient: g("#047857")(155) },
    { image: face(59), title: "المسعفة نورا", subtitle: "تمريض طوارئ — تعزيز عيادة", borderColor: "#5EEAD4", gradient: g("#0D9488")(170) },
    { image: face(45), title: "المسعف ستيريل", subtitle: "معدات وحدة الإنعاش المتقدم", borderColor: "#2DD4BF", gradient: g("#0F766E")(140) },
    { image: face(32), title: "المسعف كيو آر", subtitle: "استجابة مناطق الشمال", borderColor: "#34D399", gradient: g("#065F46")(160) },
    { image: face(68), title: "المسعفة ياسمين", subtitle: "فرز طبي — مناوبة ليلية", borderColor: "#A7F3D0", gradient: g("#059669")(175) },
    { image: face(27), title: "المسعف رايدر", subtitle: "إخلاء مركبات وساحات", borderColor: "#10B981", gradient: g("#065F46")(130) },
    { image: face(44), title: "المسعفة ليلى", subtitle: "توثيق حالات وERP طبي", borderColor: "#6EE7B7", gradient: g("#047857")(185) },
    { image: face(52), title: "المسعف تراكر", subtitle: "تنسيق مع الشرطة — كوارث", borderColor: "#34D399", gradient: g("#0F766E")(195) },
  ],
};

export const policeRoster: InstitutionRosterData = {
  leader: {
    name: "الوزير فـالكون",
    title: "وزير الداخلية",
    image: "https://images.unsplash.com/photo-1556157382-97eda2d62296?auto=format&fit=crop&w=500&q=80",
    tagline: "القيادة العليا للمنظومة الأمنية وغرفة العمليات ولجان الانضباط.",
    bio: "يرأس التخطيط الأمني العام وغرفة العمليات المركزية، ويتابع جاهزية الوحدات الخاصة والقيادات الميدانية والجرائم المنظمة والأحداث الكبرى بالتنسيق مع الإدارة العليا.",
    highlights: [
      "اعتماد السياسات الأمنية وخطط المطاردات والكمائن وفق لوائح المدينة.",
      "الإشراف على الترقيات والتحقيقات الداخلية وهيكلة LSPD.",
      "تمثيل وزارة الداخلية في التنسيق مع باقي الفصائل الحكومية.",
    ],
  },
  deputy: {
    name: "الضابط فانتوم",
    title: "نائب وزير الداخلية",
    image: "https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=500&q=80",
    tagline: "التنفيذ اليومي للدوريات والبلاغات الحرجة وسياسات التدريب.",
    bio: "يدعم وزير الداخلية في توزيع الدوريات والبلاغات الساخنة، ومتابعة الانضباط والتدريب المستمر لضباط الصف الأول والكتائب التكتيكية.",
    highlights: [
      "إدارة توزيع الدوريات حسب الذروة والمناطق الحساسة.",
      "متابعة البلاغات الساخنة وجاهزية فرق الاستجابة السريعة.",
      "ورش تدريب دورية للضباط الجدد تحت توجيه وزير الداخلية.",
    ],
  },
  members: [
    { image: face(15), title: "الضابط أطلس", subtitle: "مقدم — انتشار ميداني", borderColor: "#22D3EE", gradient: g("#0891B2")(160) },
    { image: face(13), title: "الضابط رادار", subtitle: "نقيب — بلاغات ساخنة", borderColor: "#38BDF8", gradient: g("#0284C7")(195) },
    { image: face(17), title: "الضابط فايبر", subtitle: "ملازم أول — استجابة سريعة", borderColor: "#67E8F9", gradient: g("#0E7490")(210) },
    { image: face(51), title: "الضابط كوانتم", subtitle: "ملازم — دوريات يومية", borderColor: "#A5F3FC", gradient: g("#155E75")(135) },
    { image: face(60), title: "الضابط غوست", subtitle: "مفاوض أزمات — SWAT", borderColor: "#38BDF8", gradient: g("#0369A1")(175) },
    { image: face(31), title: "الضابطة ستيلا", subtitle: "تحريات — مخدرات", borderColor: "#22D3EE", gradient: g("#0E7490")(165) },
    { image: face(46), title: "الضابط برايفت", subtitle: "مرور ومطاردات", borderColor: "#67E8F9", gradient: g("#155E75")(150) },
    { image: face(55), title: "الضابط هيلكس", subtitle: "شرطة مجتمع — دوريات ليلية", borderColor: "#7DD3FC", gradient: g("#0369A1")(140) },
    { image: face(26), title: "الضابطة رايفن", subtitle: "غرفة عمليات — بلاغات", borderColor: "#38BDF8", gradient: g("#0C4A6E")(185) },
    { image: face(61), title: "الضابط كروس", subtitle: "أمن منشآت — كاميرات", borderColor: "#A5F3FC", gradient: g("#164E63")(155) },
  ],
};

export const oversightRoster: InstitutionRosterData = {
  leader: {
    name: "المراقب أوريون",
    title: "رئيس مؤسسة الرقابة",
    image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=500&q=80",
    tagline: "ضمان الجودة، الشفافية، وتطبيق اللوائح على الجميع بالتساوي.",
    bio: "يضع معايير الجودة والمساءلة، ويعتمد تقارير التدقيق الصادرة عن الفرق الميدانية، ويتابع تنفيذ القرارات الإدارية مع الإدارة العليا للمدينة.",
    highlights: [
      "اعتماد معايير تقييم الأداء للفصائل والموظفين المعتمدين.",
      "مراجعة البلاغات الجماعية والشكاوى المعقدة قبل الإحالة النهائية.",
      "الإشراف على سياسات الخصوصية وسرية بيانات التحقيق.",
    ],
  },
  deputy: {
    name: "المراقبة فاليري",
    title: "نائب رئيس المؤسسة",
    image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=500&q=80",
    tagline: "تنسيق المراجعات الميدانية ومتابعة التزام الفصائل بالسياسات.",
    bio: "تتابع التزام الفصائل بالسياسات، وتنسق جلسات المراجعة مع الإدارة العليا، وتضمن وصول التقارير الدورية في الوقت المحدد.",
    highlights: [
      "جدولة مراجعات دورية لكل قسم مع تقارير ملخصة للرئيس.",
      "متابعة تنفيذ توصيات التدقيق وإغلاق الملفات المعلقة.",
      "بناء جسور تواصل بين الرقابة والمجتمع اللاعبين للشفافية.",
    ],
  },
  members: [
    { image: face(11), title: "المحقق سترايك", subtitle: "تدقيق بلاغات اللاعبين", borderColor: "#F59E0B", gradient: g("#D97706")(150) },
    { image: face(14), title: "المراجع كلاود", subtitle: "تحليل أداء الأقسام", borderColor: "#FBBF24", gradient: g("#B45309")(175) },
    { image: face(56), title: "المدقق نكسس", subtitle: "توثيق المخالفات", borderColor: "#FCD34D", gradient: g("#92400E")(190) },
    { image: face(38), title: "المراقب إيكو", subtitle: "مراجعات ميدانية — عصابات", borderColor: "#FB923C", gradient: g("#C2410C")(165) },
    { image: face(49), title: "المدققة روز", subtitle: "جودة تقارير الإدارات", borderColor: "#F59E0B", gradient: g("#B45309")(155) },
    { image: face(67), title: "المحقق فيموس", subtitle: "بلاغات تجمعات وباندات", borderColor: "#FBBF24", gradient: g("#92400E")(170) },
    { image: face(36), title: "المراجع آرك", subtitle: "لوائح RP وسيناريوهات", borderColor: "#FCD34D", gradient: g("#D97706")(180) },
    { image: face(43), title: "المدققة لينا", subtitle: "شكاوى لاعبين وتوثيق", borderColor: "#FB923C", gradient: g("#9A3412")(160) },
    { image: face(57), title: "المراقب درفت", subtitle: "أداء الشرطة والإسعاف", borderColor: "#F59E0B", gradient: g("#78350F")(175) },
    { image: face(29), title: "المحقق نوفايت", subtitle: "تراخيص ومخالفات إدارية", borderColor: "#FBBF24", gradient: g("#B45309")(145) },
  ],
};

export const justiceRoster: InstitutionRosterData = {
  leader: {
    name: "المستشار الحاكم",
    title: "رئيس مؤسسة وزارة العدل",
    image: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=500&q=80",
    tagline: "التمثيل القضائي الأعلى والالتزام الكامل بدستور Infinite City.",
    bio: "يرأس التوجه العام للوزارة، الالتزام بدستور المدينة، وتنسيق القضايا الإستراتيجية والموارد البشرية للقضاة والموظفين القانونيين.",
    highlights: [
      "اعتماد السياسات العامة للمحاكم والدوائر القضائية.",
      "الإشراف على القضايا ذات الأثر الواسع والارتباط بالأمن العام.",
      "تمثيل الوزارة أمام المجالس التشريعية داخل السيرفر عند الحاجة.",
    ],
  },
  deputy: {
    name: "وكيل الوزارة للشؤون القانونية",
    title: "نائب رئيس المؤسسة",
    image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=500&q=80",
    tagline: "مسارات العقوبات، التوجيهات التنظيمية، والملفات الحساسة.",
    bio: "يشرف على مسارات العقوبات والتوجيهات التنظيمية، ويمثل الوزارة في الملفات الحساسة، ويدعم الرئيس في توحيد تفسير القوانين بين المحاكم.",
    highlights: [
      "مراجعة مشاريع اللوائح الداخلية قبل اعتمادها من الرئيس.",
      "التنسيق مع الشرطة والنيابة في القضايا الجنائية المعقدة.",
      "إعداد ملخصات دورية للتعديلات المقترحة على الدستور الداخلي.",
    ],
  },
  members: [
    { image: face(21), title: "القاضي إيكليبس", subtitle: "قضايا الأمن والجرائم المنظمة", borderColor: "#B45309", gradient: g("#92400E")(145) },
    { image: face(48), title: "القاضية لومين", subtitle: "المدني والتعويضات", borderColor: "#D97706", gradient: g("#78350F")(165) },
    { image: face(53), title: "كاتب العدل فيكس", subtitle: "التوثيق والإجراءات", borderColor: "#F59E0B", gradient: g("#B45309")(200) },
    { image: face(37), title: "القاضي ماربل", subtitle: "جنح ومخالفات خفيفة", borderColor: "#EA580C", gradient: g("#9A3412")(155) },
    { image: face(42), title: "القاضية سيلين", subtitle: "رهائن وسرقات منظمات", borderColor: "#D97706", gradient: g("#92400E")(170) },
    { image: face(58), title: "كاتب العدل برايم", subtitle: "عقود شركات وأراضي", borderColor: "#B45309", gradient: g("#78350F")(185) },
    { image: face(24), title: "المستشار كراون", subtitle: "استئناف وتفتيش قضائي", borderColor: "#F59E0B", gradient: g("#C2410C")(160) },
    { image: face(35), title: "الكاتبة عدل رايز", subtitle: "توثيق يدوي وسريع", borderColor: "#EA580C", gradient: g("#92400E")(175) },
    { image: face(63), title: "القاضي ستون", subtitle: "جرائم إلكترونية وهكر", borderColor: "#D97706", gradient: g("#B45309")(165) },
    { image: face(39), title: "القاضية إيدن", subtitle: "سلاح وتصاريح خاصة", borderColor: "#FBBF24", gradient: g("#78350F")(190) },
  ],
};

export const lawyerRoster: InstitutionRosterData = {
  leader: {
    name: "المحامي جاستس",
    title: "رئيس مؤسسة المحاماة",
    image: "https://images.unsplash.com/photo-1555374018-13a8994ab246?auto=format&fit=crop&w=500&q=80",
    tagline: "استراتيجية الدفاع في القضايا الكبرى وتمثيل الموكلين بثقة.",
    bio: "يقود استراتيجية الدفاع والقضايا الكبرى، ويعتمد المذكرات الرئيسية أمام المحاكم، ويحدد سياسة المكتب في القضايا الإعلامية والحساسة.",
    highlights: [
      "اختيار فرق المرافعة وتوجيه الخط الدفاعي في القضايا الطويلة.",
      "اعتماد الصلحيات والعروض الرسمية أمام النيابة والمحكمة.",
      "تمثيل المؤسسة في الاجتماعات مع وزارة العدل والشرطة.",
    ],
  },
  deputy: {
    name: "المحامية فيرديكت",
    title: "نائب رئيس المؤسسة",
    image: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=500&q=80",
    tagline: "الدعاوى الجنائية، الأدلة، والمرافعات الثانوية والاستئناف.",
    bio: "مسؤولة عن الدعاوى الجنائية والتنسيق مع فرق الأدلة والمرافعات الثانوية؛ تخلف الرئيس في الجلسات الحرجة وتتابع جودة المذكرات الفنية.",
    highlights: [
      "مراجعة الأدلة والخبراء قبل تقديمها في الجلسات.",
      "إدارة ملفات الاستئناف والطعون مع المحامين المساعدين.",
      "دورات توجيهية للمحامين الجدد حول أسلوب المرافعة في المدينة.",
    ],
  },
  members: [
    { image: face(18), title: "المحامي لو أند أوردر", subtitle: "مرافعات وجلسات", borderColor: "#EA580C", gradient: g("#C2410C")(155) },
    { image: face(41), title: "المحامية كاونسيل", subtitle: "استشارات وقضايا مدنية", borderColor: "#FB923C", gradient: g("#9A3412")(175) },
    { image: face(54), title: "المحامي ديفنس", subtitle: "دفاع جنائي أول", borderColor: "#EA580C", gradient: g("#B45309")(165) },
    { image: face(34), title: "المحامية آيلا", subtitle: "عقود وتأسيس شركات", borderColor: "#F97316", gradient: g("#C2410C")(170) },
    { image: face(62), title: "المحامي بروتو", subtitle: "تمثيل أمام النيابة", borderColor: "#FB923C", gradient: g("#9A3412")(160) },
    { image: face(28), title: "المحامية فيرا", subtitle: "تعويضات ومدني", borderColor: "#EA580C", gradient: g("#78350F")(180) },
    { image: face(50), title: "المحامي كلايم", subtitle: "قضايا شرطة وانتهاكات", borderColor: "#F97316", gradient: g("#B45309")(150) },
    { image: face(23), title: "المحامي أوربان", subtitle: "جرائم منظمات وعصابات", borderColor: "#FB923C", gradient: g("#C2410C")(185) },
    { image: face(66), title: "المحامية نكسس", subtitle: "استئناف وطعون", borderColor: "#EA580C", gradient: g("#9A3412")(175) },
    { image: face(40), title: "المحامي سيف", subtitle: "استشارات عاجلة 24/7", borderColor: "#F97316", gradient: g("#B45309")(195) },
  ],
};

export const developerRoster: InstitutionRosterData = {
  leader: {
    name: "المبرمج آرتكس",
    title: "رئيس مؤسسة المبرمجين",
    image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=500&q=80",
    tagline: "خارطة الطريق التقنية، الجودة، والاستقرار بين السكربت والبنية.",
    bio: "يدير خارطة الطريق التقنية، جودة الإصدارات، وتنسيق الفرق بين السكربت والبنية؛ يعتمد معايير المراجعة قبل أي إطلاق على البيئة الحية.",
    highlights: [
      "اعتماد الإصدارات الرئيسية والتنسيق مع الإدارة حول الأولويات.",
      "سياسات الأمان العامة للقواعد والواجهات الحساسة.",
      "حوكمة Git والفروع وفريق الطوارئ عند الأعطال الحرجة.",
    ],
  },
  deputy: {
    name: "المبرمجة نيكست",
    title: "نائب رئيس المؤسسة",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=500&q=80",
    tagline: "CI، المراجعة الآلية، الأمان، ومتابعة الأداء بعد كل تحديث.",
    bio: "مسؤولة عن CI والمراجعة، الأمان، ومتابعة الأداء والاستقرار بعد كل تحديث؛ تتابع سجلات الأخطاء وتنسق مع السيرفر لإصلاحات الطوارئ.",
    highlights: [
      "إدارة خط أنابيب البناء والاختبار قبل الدمج للفرع الرئيسي.",
      "مراقبة الموارد والاستجابة الزمنية بعد النشرات الكبرى.",
      "جلسات ما بعد الحادث مع الفريق لتوثيق الأسباب والحلول.",
    ],
  },
  members: [
    { image: face(16), title: "سكربت كور", subtitle: "FiveM / Lua", borderColor: "#8B5CF6", gradient: g("#6D28D9")(145) },
    { image: face(30), title: "واجهات فنتوم", subtitle: "React / UI", borderColor: "#A78BFA", gradient: g("#5B21B6")(210) },
    { image: face(64), title: "بنية هيفي", subtitle: "سيرفرات ومراقبة", borderColor: "#06B6D4", gradient: g("#0E7490")(180) },
    { image: face(19), title: "باك إند رايدر", subtitle: "Node / APIs", borderColor: "#A855F7", gradient: g("#7C3AED")(165) },
    { image: face(47), title: "ديف أوبس مايجور", subtitle: "CI / Docker", borderColor: "#C084FC", gradient: g("#6D28D9")(175) },
    { image: face(22), title: "أمان شيلد", subtitle: "صلاحيات ومكافحة غش", borderColor: "#22D3EE", gradient: g("#0891B2")(155) },
    { image: face(55), title: "قواعد داتا لين", subtitle: "SQL / Redis", borderColor: "#818CF8", gradient: g("#4F46E5")(185) },
    { image: face(9), title: "فرونت ريفولف", subtitle: "تصميم نظام وتجربة", borderColor: "#C4B5FD", gradient: g("#6D28D9")(160) },
    { image: face(65), title: "برمجيات لوكس", subtitle: "اختبار واختبار حمل", borderColor: "#67E8F9", gradient: g("#0E7490")(170) },
    { image: face(70), title: "سكربت شادو", subtitle: "أحداث وميزات موسمية", borderColor: "#D946EF", gradient: g("#86198F")(175) },
  ],
};

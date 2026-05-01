import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const generalRules = [
  { id: 1, title: "العمر المسموح", description: "العمر المسموح لدخول السيرفر هو 18 سنة فما فوق ونعتذر عن تفعيل من هم أقل عمراً." },
  { id: 2, title: "إكمال السيناريو الخاطئ", description: "في حال وجودك في سيناريو وكان السيناريو خاطئ يجب عليك إكمال السيناريو حتى النهاية ثم التوجه للدعم الفني." },
  { id: 3, title: "منع القتل العشوائي", description: "القتل العشوائي (RDM) ممنوع تمامًا." },
  { id: 4, title: "فصل المخ أثناء السيناريو", description: "يمنع فصل المخ أثناء السيناريو تحت أي ظرف ويعاقب عليها بأشد العقوبات تصل إلى نهائي." },
  { id: 5, title: "منع Meta Gaming", description: "يمنع استخدام أي معلومات تم الحصول عليها من خارج اللعبة وسيعرضك للبان النهائي (Meta Gaming)." },
  { id: 6, title: "منع Power Gaming", description: "يمنع استغلال أي وسائل غير موجودة فعليًا داخل اللعبة لتحقيق ميزة (Power Gaming)." },
  { id: 7, title: "قواعد الإغماء", description: "عند الإغماء الكامل، لا يُسمح بالكلام أو الحركة أو تذكّر ما حدث خلال آخر 10 دقائق، إلا إذا تم إنعاشك وفق وسائل معتمدة داخل اللعبة." },
  { id: 8, title: "منع التواصل الخارجي", description: "يمنع التواصل الخارجي مثل Discord للتأثير على السيناريوهات داخل اللعبة." },
  { id: 9, title: "التدخل في السيناريوهات", description: "يمنع التدخل في أي سيناريو إلا بعد وجود معرفة رول بلاي مسبقة لا تقل عن أسبوع." },
  { id: 10, title: "منع قتل المنفذين", description: "لا يجوز قتل أي لاعب إذا كان ينفذ الأوامر أو بحجة النسيان." },
  { id: 11, title: "منع الشخصنة", description: "منع شخصنة الأمور بين اللاعبين تحت أي ظرف، وسيتم المحاسبة بشكل قطعي في حال صدر أي تصرفات تدل على الشخصنة بين أي من اللاعبين." },
  { id: 12, title: "منع طلقة النسيان", description: "لا يجوز إطلاق النار تحت مسمى طلقة النسيان." },
  { id: 13, title: "احترام الحياة", description: "يجب احترام حياة الجميع داخل اللعبة، وتجنّب التصرفات المتهورة أو التي تُعرّض حياة أي شخص للخطر." },
  { id: 14, title: "منع استخدام السيارة كسلاح", description: "منع منعا باتاً استخدام السيارة كسلاح (VDM) ويمنع تصديم السيارات إطلاقا سواء صدم احترافي أو غيره." },
  { id: 15, title: "القيادة الواقعية", description: "يجب الالتزام بالقيادة الواقعية: السرعة، قطع الإشارات، أو القيادة بتهور بدون مبرر تُعتبر مخالفات، وفي حال ضبطت أي مخالفة مثل هذه سيتم المحاسبة عليها." },
  { id: 16, title: "منع الحركات غير المنطقية", description: "لا يُسمح باستخدام حركات غير منطقية مثل رفع المركبات بشكل غير واقعي." },
  { id: 17, title: "قيود المركبات", description: "لا يجوز قيادة سيارة بدون إطارات أو استخدام مركبات غير مناسبة للطرق الوعرة." },
  { id: 18, title: "إيقاف السيارة التالفة", description: "في حال تم تفجير ثلاث عجلات في السيارة أثناء المطاردة يجب أن توقف السيارة في الحال، ويمكنك إكمال السيناريو هرباً على الأقدام." },
  { id: 19, title: "منع استخدام الهاتف للجريمة", description: "يمنع استخدام خدمات الهاتف بقصد السرقة أو الخطف أو القتل." },
  { id: 20, title: "منع انتحال الصفة الرسمية", description: "يمنع ارتداء زي الشرطة أو الإسعاف أو أي زي رسمي للتنكر أو التشويش سواء للعصابات أو القطاعات العسكرية." },
  { id: 21, title: "احترام الموتى", description: "احترام الموتى داخل اللعبة واجب، ويُمنع إهانتهم بأي شكل." },
  { id: 22, title: "منع تصوير المسقطين", description: "يمنع تصوير المسقطين تحت أي ظرف." },
  { id: 23, title: "منع حمل اللاعبين أثناء القيادة", description: "لا يجوز حمل أو سحب أي لاعب أثناء قيادتك للمركبة." },
  { id: 24, title: "قيود الهروب أثناء المطاردة", description: "أثناء المطاردة، لا يسمح بدخول المنازل أو البحر أو مواقع العمل للهرب." },
  { id: 25, title: "النزول للبحر", description: "يمنع النزول للبحر إلا في حالة ارتداء عدة الغوص." },
  { id: 26, title: "الحد الأقصى للحمل والسحب", description: "لا يجوز حمل أو سحب أكثر من شخص في آن واحد (حمل + سحب)." },
  { id: 27, title: "التحلل بعد الموت", description: "إذا ماتت شخصيتك ضمن سيناريو، فلا يحق لك التحلل، في غير السيناريوهات، لا يوجد تعويض عن محتوى الشنطة عند التحلل." },
  { id: 28, title: "التعويض عن المفقودات", description: "في حال فقدت أي من أغراضك بأي طريقة وترغب بالتعويض يجب أن يكون لديك تصوير للمفقودات غير ذلك لم يتم تعويضك." },
  { id: 29, title: "تسجيل الشاشة", description: "الرقابة لها الحق في استدعائك، ويجب أن يكون لديك تسجيل شاشة كامل بالصوت للطرفين باستخدام برامج موثوقة مثل GeForce أو NVIDIA، مع منع استخدام Game Capture." },
  { id: 30, title: "استخدام وسائل التواصل", description: "يمنع استخدام تويتر أو أي وسيلة تواصل داخل اللعبة في غير محتوى الرول بلاي." },
  { id: 31, title: "منع مشاركة الحسابات", description: "لا يُسمح بمشاركة حسابات الدخول مثل Steam أو Discord أو FiveM مع أي شخص." },
  { id: 32, title: "مدة البقاء بعد السيناريو", description: "لا تغادر السيرفر إلا بعد مرور 15 دقيقة من انتهاء السيناريو." },
  { id: 33, title: "منع المواضيع الحساسة", description: "يمنع التحدث في السياسة، الدين، الأعراض، أو استخدام أي عبارات مسيئة أو مضايقات." },
  { id: 34, title: "منع الغش", description: "الغش أو استغلال الثغرات أو التخريم أو أوامر الشات أو استخدام وضعيات النائم/الميت أثناء القتال ممنوع تمامًا." },
  { id: 35, title: "منع متابعة البثوث", description: "يمنع متابعة البثوث (Stream Sniping) أو استخدامها أثناء اللعب." },
  { id: 36, title: "الواقعية في اللعب", description: "يجب الالتزام بواقعية الحياة داخل اللعب سواء كنت مجرمًا أو رهينة." },
  { id: 37, title: "شروط الرهائن", description: "لا تأخذ رهائن من معارفك، ويمنع الاتفاق المسبق معهم ليكونوا رهائن، ويمنع على الرهائن أن تساعد الخاطفين." },
  { id: 38, title: "المشاركة في السيناريوهات الإجرامية", description: "يمنع المشاركة في سيناريوهات إجرامية دون علاقة رول بلاي سابقة لا تقل عن أسبوع." },
];

const crimeRules = [
  { id: 1, title: "تحالف العصابات", description: "لا يُسمح بتحالف العصابات ضد الشرطة أو عصابات أخرى إلا في السرقات الكبيرة المسموح بها أو بأمر من الـ GodFather." },
  { id: 2, title: "منع الخطف في وجود لاعبين", description: "يمنع الخطف أو التهديد في منطقة يوجد بها على الأقل لاعب واحد." },
  { id: 3, title: "منع اختطاف رهائن للضغط", description: "لا يجوز اختطاف رهائن من أجل الضغط لإطلاق سراح سجناء (تستثنى سيناريوهات الـ GodFather من هذا القانون)." },
  { id: 4, title: "إنزال المحمول أثناء إطلاق النار", description: "أثناء إطلاق النار، يجب إنزال أي شخص تحمله قبل الاشتباك." },
  { id: 5, title: "منع تقليد العصابات", description: "يمنع تقليد زي أو أسلوب أي عصابة أخرى داخل السيرفر." },
  { id: 6, title: "حماية المفاوض", description: "لا يُسمح بالاعتداء على المفاوض سواء كان من الشرطة أو المجرمين أثناء التفاوض." },
  { id: 7, title: "منع إطلاق النار في الاستيقاف", description: "يمنع إطلاق النار أو اختطاف العسكريين في حالات الاستيقاف المروري." },
  { id: 8, title: "حماية الموظفين", description: "لا يجوز اختطاف أو الاعتداء على لاعبين يرتدون الزي الرسمي لأي وظيفة (حكومية أو خاصة) عدا منتسبي وزارة الداخلية." },
  { id: 9, title: "منع الهروب للمناطق الآمنة", description: "يمنع الهروب من السيناريو إلى المناطق الآمنة ويحق لك الهروب إلى مركز الشرطة فقط في حال كانت تطاردك عصابة طلبا للحماية." },
  { id: 10, title: "حماية المناطق الآمنة", description: "المنطقة الآمنة تبقى آمنة ويمنع أن ينتقل أي سيناريو إليها أو إكماله فيها." },
  { id: 11, title: "منع جرائم الموظفين", description: "يمنع على أي شخص يرتدي زي رسمي (مثل التاكسي، المحامي، المسعف، أو الشرطي) ارتكاب الجرائم تحت أي ظرف." },
  { id: 12, title: "منع سرقة المروحيات", description: "يمنع سرقة المروحيات منعا باتا." },
  { id: 13, title: "الحد الأقصى لأعضاء العصابة", description: "الحد الأقصى لعدد أعضاء أي عصابة داخل السيرفر هو 21 عضوًا فقط." },
  { id: 14, title: "منع الاشتباك بدون سبب", description: "يُمنع افتعال شجارات أو قتال بدون وجود سبب واضح ومقنع ضمن الرول بلاي." },
  { id: 15, title: "الحد الأقصى للرهائن", description: "الحد الأقصى للرهائن في أي سيناريو سرقة هو رهينتان فقط." },
  { id: 16, title: "مبلغ التفاوض", description: "المبلغ المسموح التفاوض عليه 10 الاف في حال كان مواطن و 20 ألف في حال كان عسكري." },
  { id: 17, title: "منع خطف المسقطين", description: "يمنع خطف الأشخاص وهم مسقطون بغض النظر أكان إسقاط أو إغماء تحت أي ظرف." },
  { id: 18, title: "منع كلبشة الميت", description: "يمنع كلبشة الميت بتاتا." },
  { id: 19, title: "منع إعادة الخطف", description: "لا يُسمح بإعادة خطف شخص أو إسقاطه مجددًا بعد علاجه مباشرة." },
  { id: 20, title: "منع الإيموت خلال الاشتباكات", description: "يُمنع استخدام أي إيموت خلال الاشتباكات أو إطلاق النار." },
  { id: 21, title: "منع الحلف أثناء النصب", description: "أثناء النصب، يمنع الحلف بالله أو القسم بأي شكل." },
  { id: 22, title: "منع تلويت المسقط", description: "يمنع تلويت المسقط تحت أي ظرف." },
  { id: 23, title: "مدة احتجاز الرهائن", description: "المدة القصوى لاحتجاز الرهينة هي 20 دقيقة، إلا إذا تم البدء في سيناريو فعلي و24 ساعة في حالات السيناريوهات الكبيرة، ولا يوجد وقت محدد في حالة سيناريوهات الـ GodFather." },
  { id: 24, title: "منع الحركات غير الواقعية", description: "يمنع استخدام حركات غير واقعية أثناء القتالات أو الفايتات مثل الايموت أو استخدام الراديو." },
  { id: 25, title: "تصوير الشاشة", description: "يجب تشغيل برنامج تصوير الشاشة دائمًا أثناء اللعب، مع حفظ التسجيلات لمدة لا تقل عن 20 دقيقة." },
  { id: 26, title: "صلاحيات الرقابة", description: "للرقابة الحق في اتخاذ الإجراءات المناسبة على أي سلوك مخالف حتى لو لم يُذكر بشكل صريح في هذه القوانين." },
  { id: 27, title: "منع إنعاش المسقط", description: "يمنع إنعاش المسقط خلال أي سيناريو ويمنع أن تنعش نفسك خلال السيناريو بأمر الإنعاش." },
  { id: 28, title: "أهمية الحياة", description: "حياتك داخل اللعبة مهمة ويجب أن تخاف على حياتك والحفاظ عليها في جميع الحالات، وعدم خوفك على حياتك يعرضك للبان النهائي." },
  { id: 29, title: "حمل السلاح أثناء القيادة", description: "يمنع حمل السلاح أثناء قيادة المركبة أو قبل ركوبها، ويجب حمل السلاح عند النزول من المركبة فقط." },
  { id: 30, title: "شروط الشكاوى", description: "لن تقبل الإدارة أي شكوى دون وجود تصوير فيديو كامل للحالة مع الصوت ورقم ID للاعب المشتكى عليه، وفي حال وجود خطأ من المشتكي سيحاسب أيضاً." },
  { id: 31, title: "توقيت الشكاوى", description: "لن تأخذ الإدارة أي شكوى إلا بعد انتهاء السيناريو بالكامل، وسيحاسب من يذهب للإدارة قبل انتهاء السيناريو." },
  { id: 32, title: "مدة السرقات", description: "الوقت المسموح لأي سيناريو سرقة هو 20 دقيقة ويجب إنهاء الحالة خلال هذه المدة دون إطالة." },
  { id: 33, title: "مدة القتال الكبير", description: "الوقت المسموح لأي قتال كبير هو ساعة واحدة ويمنع تجاوزها." },
  { id: 34, title: "عقوبة Stream Sniping", description: "يعاقب بالباند النهائي كل من يقوم بأخذ معلومات من البثوث (Stream Snipe)." },
  { id: 35, title: "الهجوم على المراكز العسكرية", description: "يمنع الهجوم على أي مركز عسكري إلا في حالة القبض على الـ GodFather أو نائبه أو قائد عصابة معينة فقط." },
  { id: 36, title: "منع رهائن الحالات المفتوحة", description: "يمنع أخذ رهائن في الحالات المفتوحة، كما يمنع أخذ رهينة لبدء حالة مفتوحة." },
  { id: 37, title: "حماية العساكر", description: "في حال وجود أقل من 5 عساكر في المدينة يمنع خطف أي عسكري." },
  { id: 38, title: "إطلاق النار من المركبة", description: "يمنع إطلاق النار من داخل المركبة لأي لاعب، ويسمح للعساكر باستخدام التيزر في المطاردات فقط." },
  { id: 39, title: "بروتوكولات العساكر", description: "يجب على العسكري الالتزام بالبروتوكولات العسكرية المنصوص عليها في قوانين وزارة الداخلية، ويحاسب المخالف إدارياً وداخل قطاعه." },
  { id: 40, title: "شروط الكلبشة", description: "يمنع كلبشة أي شخص قبل تحذيره 3 مرات، مع فاصل 5 ثواني بين كل تحذير، وبعدها يسمح بالكلبش الإجباري." },
  { id: 41, title: "معاملة الرهينة", description: "يجب معاملة الرهينة بطريقة لائقة ومنع التلفظ بأي ألفاظ خادشة أو مخلة." },
  { id: 42, title: "منع تهريب الموقوفين", description: "يمنع سحب موقوف من العساكر أو تهريبه طالما هو موقوف لديهم." },
  { id: 43, title: "منع تهريب المسقط", description: "يمنع سحب مسقط لتهريبه من قبل العصابات أثناء أي قتال." },
  { id: 44, title: "منع الانتظار بعد السرقة", description: "يمنع السرقة ثم الانتظار في نفس الموقع لفترة سواء للتفاوض أو غيره." },
  { id: 45, title: "منع تدبيل الراديو", description: "يمنع منعاً باتاً تدبيل الراديو أثناء إطلاق النار." },
];

const organizationalRules = [
  { id: 1, title: "إصدار الوثائق الرسمية", description: "يجب على الجميع إصدار بطاقة شخصية ورخصة قيادة، وإلا ستتم محاسبته من الشرطة." },
  { id: 2, title: "أسماء العائلات", description: "في حال لعب رول عائلة يجب تشابه أفراد العائلة في اسم العائلة." },
  { id: 3, title: "الأسماء الحقيقية", description: "يجب أن يكون الاسم داخل المدينة اسماً حقيقياً بدون زخرفة أو اختصارات أو علامات ترقيم." },
  { id: 4, title: "شروط الاسم الأول", description: "يجب أن يكون الاسم الأول بدون كلمة (أبو) وأن يكون اسماً حقيقياً." },
  { id: 5, title: "منع إضافة كلمات للأسماء", description: "يمنع إضافة كلمات مثل Kick أو Gamming أو TikTok وما شابه إلى الاسم." },
  { id: 6, title: "مقاومة الأسلحة", description: "يمنع مقاومة سلاح درجة أعلى بسلاح درجة أدنى منه تحت أي ظرف." },
  { id: 7, title: "فترة الخروج من العصابة", description: "في حال خروج لاعب من عصابة يجب الانتظار أسبوع قبل الانضمام لعصابة أخرى." },
  { id: 8, title: "الخروج من الخدمة العسكرية", description: "في حال أراد عسكري الخروج من الخدمة يجب تسليم عتاده بالكامل، وفي حال الهروب يجب ترك العتاد بالمركز وإبلاغ القائد بمكانه." },
  { id: 9, title: "الانتساب للقطاعات الداخلية", description: "في حال أراد فرد من عصابة الانتساب لقطاعات الداخلية يجب الانتظار أسبوع والتواصل مع وزارة العدل لتصفير ملفه حسب الأنظمة." },
  { id: 10, title: "بعد إعدام الشخصية", description: "في حال إعدام شخصيتك لن يتم منحك شخصية جديدة إلا بعد 24 ساعة، ولن ينقل إليها إلا المقتنيات المشتراة من متجر المدينة." },
  { id: 11, title: "السحب الفعلي", description: "عند سحب أي شيء من لاعب يجب سحبه فعلياً ولا يعتمد على القول فقط." },
  { id: 12, title: "منع الإساءة", description: "يمنع الإساءة نهائياً حتى لو كانت بسيطة، كما يمنع استخدام لهجات مختلفة للإساءة حتى على سبيل المزاح." },
  { id: 13, title: "منع تخريب السيناريوهات", description: "تخريب أي سيناريو يعرضك للباند النهائي دون تهاون." },
  { id: 14, title: "تهريب العتاد", description: "تهريب أي عتاد عسكري أو طبي من القطاعات يعرضك للمساءلة الإدارية." },
  { id: 15, title: "احترام القيادات", description: "يجب على القطاعات العسكرية والطبية احترام القيادات الأعلى والالتزام بالجدية في العمل." },
  { id: 16, title: "منع التعرف بالصوت", description: "يمنع التعرف على اللاعب من خلال صوته داخل اللعبة، ويجوز التعرف عليه من الشكل فقط." },
  { id: 17, title: "سلوك المقبوض عليهم", description: "يجب على المقبوض عليهم تقدير وجودهم داخل القطاع العسكري والتعامل بجدية والخوف على حياتهم، وإلا ستتم محاسبتهم إدارياً ومن قبل العساكر." },
  { id: 18, title: "القبض على العسكري خارج الخدمة", description: "في حالة القبض على عسكري وهو خارج الخدمة يتم التعامل معه كعسكري في حالات الخطف." },
];

const crimeNegotiationRules = [
  { id: 1, title: "النصب في المناطق الآمنة", description: "يسمح بالنصب في المناطق الآمنة." },
  { id: 2, title: "منع القتل بعد النصب", description: "لا يجوز قتل شخص بعد أن تنصب عليه بحجة النسيان." },
  { id: 3, title: "منع استفزاز الشرطة", description: "لا تلاحق الشرطة بهدف الاستفزاز أو بناء العداوات الشخصية." },
  { id: 4, title: "منع العداوات البسيطة", description: "يمنع تكوين العداوات على أسباب بسيطة أو تافهة، ويُفضل التوجه للشرطة داخل الرول بلاي." },
  { id: 5, title: "شروط العداوات", description: "يمنع تكوين العداوات بين المواطنيين، وتكون العداوات فقط بين العصابات ويجب الإعلان عنها على تويتر المدينة بشكل واضح وصريح (وإبلاغ الإدارة العليا بها)." },
  { id: 6, title: "التفاوض قبل العداوة", description: "قبل تكوين العداوة يجب على قادة العصابات التفاوض لإرجاع الحق المأخوذ منهم، وفي حال استجابة القادة للطلبات لا يوجد سبب لبدء عداوة." },
  { id: 7, title: "شروط التلويت", description: "يسمح التلويت بين أفراد العصابات الذين أعلنوا عن عداوات بين بعضهم فقط، ولا يسمح تلويت أي شخص لا يوجد بينك وبينه عداوة." },
  { id: 8, title: "مكان تلويت المخطوف", description: "يجب أن يكون تلويت المخطوف في مقر عصابة الخاطف فقط ولا يسمح بالتلويت في أي مكان آخر." },
];

const warningLevels = [
  { id: 1, title: "إنذار أول", duration: "6 ساعات" },
  { id: 2, title: "إنذار ثاني", duration: "24 ساعة" },
  { id: 3, title: "إنذار ثالث", duration: "3 أيام" },
  { id: 4, title: "إنذار رابع", duration: "7 أيام" },
  { id: 5, title: "إنذار خامس", duration: "باند نهائي" },
];

const specificPenalties = [
  { id: 1, title: "فصل المخالف", penalty: "تبدأ العقوبة من أسبوع وتصل إلى النهائي." },
  { id: 2, title: "عدم الخوف على الحياة", penalty: "تبدأ العقوبة من أسبوع وتصل إلى نهائي." },
  { id: 3, title: "الخروج عن النص", penalty: "تبدأ العقوبة من أسبوع وتصل إلى نهائي." },
  { id: 4, title: "الألفاظ النابية", penalty: "عقوبتها باند نهائي مباشر." },
  { id: 5, title: "الستريم سنايب", penalty: "عقوبتها باند نهائي مباشر." },
];

const robberyPeopleRules = [
  { label: "ATM Robbery صراف آلي", value: "(1)" },
  { label: "Store Robbery بقالة", value: "(1-3)" },
  { label: "House Robbery منزل", value: "(1-4)" },
  { label: "Fleeca Bank Robberies سرقة بنك فليكا لوس", value: "(3-5)" },
  { label: "Blane County Robbery سرقة مقاطعة بلين بوليتو", value: "(4-6)" },
  { label: "Maze Bank Robbery سرقة بنك ميز", value: "(4-6)" },
  { label: "Jewelry Robbery سرقة المجوهرات", value: "(5-8)" },
  { label: "Underground Robbery سرقة مخزون الشرطة", value: "(8-12)" },
  { label: "Central Bank Robbery سرقة البنك المركزي", value: "(8-12)" },
];

const directPoliceUnitsRules = [
  { label: "ATM Robbery", value: "(3)" },
  { label: "Store Robbery", value: "(5)" },
  { label: "House Robbery", value: "(6)" },
  { label: "Fleeca Bank Robberies", value: "(7)" },
  { label: "Blane County Robbery", value: "(8)" },
  { label: "Maze Bank", value: "(8)" },
  { label: "Jewelry Robbery", value: "(9)" },
  { label: "Underground Robbery", value: "(14)" },
  { label: "Central Bank Robbery", value: "(14)" },
];

const safeZones = [
  { icon: "🏢", label: "مراكز الشرطة" },
  { icon: "🏥", label: "المستشفيات" },
  { icon: "🏠", label: "الشقق العامة" },
  { icon: "🍽️", label: "داخل المطاعم و الكافيهات" },
  { icon: "🔧", label: "ورشات تصليح المركبات" },
  { icon: "🔒", label: "السجن" },
  { icon: "⚖️", label: "المحكمة" },
  { icon: "🚗", label: "حجز المركبات" },
  { icon: "🚘", label: "معارض السيارات" },
  { icon: "🔑", label: "تأجير السيارات" },
  { icon: "🎰", label: "كازينو" },
  { icon: "💈", label: "أماكن الوشوم والحلاقة وتغيير الملابس (عدا الأرصفة)" },
];

const storeRules = [
  { id: 1, title: "الموافقة على الشروط", description: "شراؤك لأي منتج يعني موافقتك على جميع الشروط والأحكام المذكورة أدناه." },
  { id: 2, title: "عدم استرجاع المشتريات", description: "سياسة المتجر تنص على أن جميع المشتريات غير قابلة للاستبدال أو الإرجاع." },
  { id: 3, title: "منع بيع المنتجات", description: "لا يحق لك بيع المنتجات لشخص آخر، وفي حال المخالفة يتم باند للطرفين." },
  { id: 4, title: "سحب المشتريات عند الباند", description: "في حال تبند الشخص باند نهائي، يحق للمتجر سحب المشتريات وذلك بعد 48 ساعة من الباند." },
  { id: 5, title: "المنتجات الإلكترونية", description: "شراؤك للمنتجات يعني موافقتك على أنك تقوم بشراء منتج إلكتروني وهي سلعة افتراضية داخل المدينة." },
  { id: 6, title: "منع نقل المشتريات", description: "لا يحق لك نقل المشتريات من شخصية لأخرى." },
  { id: 7, title: "تصفير المشتريات", description: "يتم تصفير المشتريات من شخصيتك كل سيزون جديد." },
  { id: 8, title: "ملفات خارجية", description: "لا نقبل أي ملف خارجي، الرجاء عدم الإحراج إلا في حالات استثنائية." },
];

const JusticePage = () => {
  return (
    <div dir="rtl" className="min-h-screen bg-background text-foreground antialiased">
      <Navbar />
      <main className="pb-20">
        <section className="relative h-[46vh] min-h-[300px] max-h-[520px] overflow-hidden">
          <img
            src="/INF-CONECT-LOGO.gif"
            alt="صورة تعبر عن قوانين السيرفر"
            className="absolute inset-0 h-full w-full object-cover"
            onError={(event) => {
              event.currentTarget.onerror = null;
              event.currentTarget.src = "/placeholder.svg";
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/75 via-background/10 to-background/85" />
          <div className="absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-background/55 to-transparent backdrop-blur-sm" />
          <div className="absolute inset-x-0 -bottom-8 h-32 bg-gradient-to-t from-background/90 via-background/60 to-transparent backdrop-blur-sm" />
          <div className="absolute inset-x-0 bottom-8 flex justify-center px-4">
            <h1 className="font-display text-4xl md:text-6xl font-bold text-center drop-shadow-[0_8px_24px_hsl(var(--background)/0.85)]">
              <span className="text-gradient-neon">القوانين</span>
            </h1>
          </div>
        </section>

        <section className="w-full px-4 md:px-8 xl:px-12 pt-10">
          <div className="glass-panel rounded-2xl p-8 md:p-12 text-center">
            <span className="font-display text-xs tracking-[0.35em] text-primary">SERVER RULES</span>
            <h2 className="mt-4 font-display text-3xl md:text-5xl font-bold">
              قوانين <span className="text-gradient-neon">Infinite City RP</span>
            </h2>
            <p className="mt-4 text-lg text-muted-foreground max-w-3xl mx-auto">
              يجب أن يكون لديك اطلاع كامل على قوانين Infinite City RP.
            </p>
            <p className="mt-4 text-muted-foreground max-w-4xl mx-auto leading-8">
              أنت الآن على أبواب دخول مدينة إنفينيتي. نرجو منك الإلمام والمعرفة بكافة تفاصيل سيرفرات الـ CFW، في إنفينيتي نحن نسعى
              لتكوين مجتمع أقرب للكمال في مجال الـ Roleplay ونرجو أن تكون أحد هؤلاء النخبة الذين نبحث عنهم ونسعى لاستقطابهم وأن
              تكون جزءاً من هذا النجاح.
            </p>
          </div>
        </section>

        <section className="w-full px-4 md:px-8 xl:px-12 mt-10">
          <Accordion type="single" collapsible defaultValue="general-rules" className="space-y-5">
            <AccordionItem value="general-rules" className="glass-panel overflow-hidden rounded-2xl border border-border/50 bg-background/35 px-6 shadow-[0_8px_22px_hsl(var(--background)/0.28)] md:px-8">
              <AccordionTrigger className="py-6 text-right hover:no-underline">
                <div className="flex flex-col items-start gap-1">
                  <h3 className="font-display text-3xl md:text-4xl font-bold">القوانين العامة</h3>
                  <p className="text-muted-foreground">القواعد الأساسية التي تنطبق على جميع اللاعبين.</p>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pb-6">
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {generalRules.map((rule) => (
                    <article
                      key={rule.id}
                      className="group rounded-2xl border border-border/60 bg-background/65 p-5 shadow-[0_6px_16px_hsl(var(--background)/0.30)] transition-colors duration-200 hover:border-primary/45 hover:bg-background/75 md:p-6 [content-visibility:auto] [contain-intrinsic-size:280px]"
                    >
                      <div className="flex items-center gap-3">
                        <span className="inline-flex h-9 min-w-9 items-center justify-center rounded-full bg-primary/20 px-2 text-sm font-display text-primary transition-colors duration-300 group-hover:bg-primary/30">
                          {rule.id}
                        </span>
                        <h4 className="font-display text-xl md:text-2xl">{rule.title}</h4>
                      </div>
                      <p className="mt-3 text-muted-foreground leading-8">{rule.description}</p>
                    </article>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="crime-rules" className="glass-panel overflow-hidden rounded-2xl border border-border/50 bg-background/35 px-6 shadow-[0_8px_22px_hsl(var(--background)/0.28)] md:px-8">
              <AccordionTrigger className="py-6 text-right hover:no-underline">
                <div className="flex flex-col items-start gap-1">
                  <h3 className="font-display text-3xl md:text-4xl font-bold">قوانين الإجرام</h3>
                  <p className="text-muted-foreground">القواعد الخاصة بالأنشطة الإجرامية والعصابات.</p>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pb-6">
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {crimeRules.map((rule) => (
                    <article
                      key={rule.id}
                      className="group rounded-2xl border border-border/60 bg-background/65 p-5 shadow-[0_6px_16px_hsl(var(--background)/0.30)] transition-colors duration-200 hover:border-secondary/45 hover:bg-background/75 md:p-6 [content-visibility:auto] [contain-intrinsic-size:280px]"
                    >
                      <div className="flex items-center gap-3">
                        <span className="inline-flex h-9 min-w-9 items-center justify-center rounded-full bg-secondary/20 px-2 text-sm font-display text-secondary transition-colors duration-300 group-hover:bg-secondary/30">
                          {rule.id}
                        </span>
                        <h4 className="font-display text-xl md:text-2xl">{rule.title}</h4>
                      </div>
                      <p className="mt-3 text-muted-foreground leading-8">{rule.description}</p>
                    </article>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="organizational-rules" className="glass-panel overflow-hidden rounded-2xl border border-border/50 bg-background/35 px-6 shadow-[0_8px_22px_hsl(var(--background)/0.28)] md:px-8">
              <AccordionTrigger className="py-6 text-right hover:no-underline">
                <div className="flex flex-col items-start gap-1">
                  <h3 className="font-display text-3xl md:text-4xl font-bold">القوانين التنظيمية</h3>
                  <p className="text-muted-foreground">القواعد الخاصة بالتنظيم والإجراءات الإدارية.</p>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pb-6">
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {organizationalRules.map((rule) => (
                    <article
                      key={rule.id}
                      className="group rounded-2xl border border-border/60 bg-background/65 p-5 shadow-[0_6px_16px_hsl(var(--background)/0.30)] transition-colors duration-200 hover:border-accent/45 hover:bg-background/75 md:p-6 [content-visibility:auto] [contain-intrinsic-size:280px]"
                    >
                      <div className="flex items-center gap-3">
                        <span className="inline-flex h-9 min-w-9 items-center justify-center rounded-full bg-accent/20 px-2 text-sm font-display text-accent transition-colors duration-300 group-hover:bg-accent/30">
                          {rule.id}
                        </span>
                        <h4 className="font-display text-xl md:text-2xl">{rule.title}</h4>
                      </div>
                      <p className="mt-3 text-muted-foreground leading-8">{rule.description}</p>
                    </article>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="crime-negotiation-rules" className="glass-panel overflow-hidden rounded-2xl border border-border/50 bg-background/35 px-6 shadow-[0_8px_22px_hsl(var(--background)/0.28)] md:px-8">
              <AccordionTrigger className="py-6 text-right hover:no-underline">
                <div className="flex flex-col items-start gap-1">
                  <h3 className="font-display text-3xl md:text-4xl font-bold">قوانين الجرائم والتفاوض</h3>
                  <p className="text-muted-foreground">القواعد الخاصة بالجرائم والتفاوض بين الأطراف.</p>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pb-6">
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {crimeNegotiationRules.map((rule) => (
                    <article
                      key={rule.id}
                      className="group rounded-2xl border border-border/60 bg-background/65 p-5 shadow-[0_6px_16px_hsl(var(--background)/0.30)] transition-colors duration-200 hover:border-primary/45 hover:bg-background/75 md:p-6 [content-visibility:auto] [contain-intrinsic-size:280px]"
                    >
                      <div className="flex items-center gap-3">
                        <span className="inline-flex h-9 min-w-9 items-center justify-center rounded-full bg-primary/20 px-2 text-sm font-display text-primary transition-colors duration-300 group-hover:bg-primary/30">
                          {rule.id}
                        </span>
                        <h4 className="font-display text-xl md:text-2xl">{rule.title}</h4>
                      </div>
                      <p className="mt-3 text-muted-foreground leading-8">{rule.description}</p>
                    </article>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="penalty-system" className="glass-panel overflow-hidden rounded-2xl border border-border/50 bg-background/35 px-6 shadow-[0_8px_22px_hsl(var(--background)/0.28)] md:px-8">
              <AccordionTrigger className="py-6 text-right hover:no-underline">
                <div className="flex flex-col items-start gap-1">
                  <h3 className="font-display text-3xl md:text-4xl font-bold">نظام العقوبات</h3>
                  <p className="text-muted-foreground">الإنذارات والعقوبات في السيرفر.</p>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pb-6">
                <div className="rounded-2xl border border-border/50 bg-gradient-to-br from-background/90 to-background/55 p-5 md:p-6">
                  <h4 className="font-display text-2xl md:text-3xl">الإنذارات المتدرجة</h4>
                  <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {warningLevels.map((warning) => (
                      <article
                        key={warning.id}
                        className="group rounded-2xl border border-border/60 bg-background/65 p-5 shadow-[0_6px_16px_hsl(var(--background)/0.30)] transition-colors duration-200 hover:border-destructive/40 hover:bg-background/75 [content-visibility:auto] [contain-intrinsic-size:220px]"
                      >
                        <div className="flex items-center gap-3">
                          <span className="inline-flex h-9 min-w-9 items-center justify-center rounded-full bg-destructive/20 px-2 text-sm font-display text-destructive transition-colors duration-300 group-hover:bg-destructive/30">
                            {warning.id}
                          </span>
                          <h5 className="font-display text-xl">{warning.title}</h5>
                        </div>
                        <p className="mt-3 text-muted-foreground text-lg">{warning.duration}</p>
                      </article>
                    ))}
                  </div>
                </div>

                <div className="mt-6 rounded-2xl border border-border/50 bg-gradient-to-br from-background/90 to-background/55 p-5 md:p-6">
                  <h4 className="font-display text-2xl md:text-3xl">العقوبات المحددة</h4>
                  <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {specificPenalties.map((item) => (
                      <article
                        key={item.id}
                        className="group rounded-2xl border border-border/60 bg-background/65 p-5 shadow-[0_6px_16px_hsl(var(--background)/0.30)] transition-colors duration-200 hover:border-primary/40 hover:bg-background/75 [content-visibility:auto] [contain-intrinsic-size:220px]"
                      >
                        <div className="flex items-center gap-3">
                          <span className="inline-flex h-9 min-w-9 items-center justify-center rounded-full bg-primary/20 px-2 text-sm font-display text-primary transition-colors duration-300 group-hover:bg-primary/30">
                            {item.id}
                          </span>
                          <h5 className="font-display text-xl">{item.title}</h5>
                        </div>
                        <p className="mt-3 text-muted-foreground text-lg">{item.penalty}</p>
                      </article>
                    ))}
                  </div>
                </div>

                <div className="mt-6 rounded-2xl border border-border/50 bg-gradient-to-br from-background/90 to-background/55 p-5 md:p-6">
                  <h4 className="font-display text-2xl md:text-3xl">عدد الأشخاص بالسرقات</h4>
                  <p className="mt-2 text-muted-foreground">الحد الأدنى والأقصى لعدد المشاركين في كل سرقة.</p>

                  <div className="mt-5 rounded-xl border border-border/50 bg-background/45 p-4 md:p-5">
                    <h5 className="font-display text-xl">قائمة السرقات</h5>
                    <div className="mt-4 grid gap-3 md:grid-cols-2">
                      {robberyPeopleRules.map((item) => (
                        <div key={item.label} className="flex items-center justify-between gap-4 rounded-xl border border-border/50 bg-background/65 px-4 py-3 shadow-[0_4px_12px_hsl(var(--background)/0.26)] transition-colors duration-200 hover:border-primary/30 hover:bg-background/75">
                          <span className="text-sm md:text-base">{item.label}</span>
                          <span className="font-display text-primary">{item.value}</span>
                        </div>
                      ))}
                    </div>
                    <p className="mt-4 text-sm text-muted-foreground">تنبيه: السرقات هذه يجب عليك جلب رهينة للسرقة.</p>
                  </div>

                  <div className="mt-5 rounded-xl border border-border/50 bg-background/45 p-4 md:p-5">
                    <h5 className="font-display text-xl">عدد الوحدات المباشرة للحالات</h5>
                    <div className="mt-4 grid gap-3 md:grid-cols-2">
                      {directPoliceUnitsRules.map((item) => (
                        <div key={item.label} className="flex items-center justify-between gap-4 rounded-xl border border-border/50 bg-background/65 px-4 py-3 shadow-[0_4px_12px_hsl(var(--background)/0.26)] transition-colors duration-200 hover:border-secondary/30 hover:bg-background/75">
                          <span className="text-sm md:text-base">{item.label}</span>
                          <span className="font-display text-secondary">{item.value}</span>
                        </div>
                      ))}
                    </div>
                    <p className="mt-4 text-sm text-muted-foreground">الحالات المفتوحة = العدد المحدد للحالة بالإضافة إلى 11.</p>
                    <p className="mt-2 text-sm text-muted-foreground">For Police: <span className="font-display text-foreground">11 MAX</span></p>
                  </div>
                </div>

                <div className="mt-6 rounded-2xl border border-border/50 bg-gradient-to-br from-background/90 to-background/55 p-5 md:p-6">
                  <h4 className="font-display text-2xl md:text-3xl">المناطق الآمنة</h4>
                  <p className="mt-2 text-muted-foreground">الأماكن المحظورة فيها الجرائم والعنف.</p>

                  <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                    {safeZones.map((zone) => (
                      <div
                        key={zone.label}
                        className="flex items-center gap-3 rounded-xl border border-border/50 bg-background/65 px-4 py-3 shadow-[0_4px_12px_hsl(var(--background)/0.26)] transition-colors duration-200 hover:border-primary/30 hover:bg-background/75"
                      >
                        <span className="text-xl">{zone.icon}</span>
                        <span className="text-sm md:text-base">{zone.label}</span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-5 rounded-xl border border-primary/35 bg-primary/10 p-4">
                    <p className="text-sm leading-7 text-muted-foreground">
                      <span className="font-display text-foreground">المناطق الآمنة:</span> في هذه المناطق يمنع ارتكاب أي جرائم أو أعمال
                      عنف، ويجب على جميع اللاعبين احترام القوانين والنظام العام.
                    </p>
                    <p className="mt-3 text-sm leading-7 text-muted-foreground">
                      <span className="font-display text-foreground">ملاحظة هامة:</span> يحق للشرطة الدخول على أي منطقة آمنة وإطلاق
                      النار فيها ضمن القوانين.
                    </p>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="store-rules" className="glass-panel overflow-hidden rounded-2xl border border-border/50 bg-background/35 px-6 shadow-[0_8px_22px_hsl(var(--background)/0.28)] md:px-8">
              <AccordionTrigger className="py-6 text-right hover:no-underline">
                <div className="flex flex-col items-start gap-1">
                  <h3 className="font-display text-3xl md:text-4xl font-bold">قوانين المتجر</h3>
                  <p className="text-muted-foreground">شروط وأحكام المشتريات من المتجر.</p>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pb-6">
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {storeRules.map((rule) => (
                    <article
                      key={rule.id}
                      className="group rounded-2xl border border-border/60 bg-background/65 p-5 shadow-[0_6px_16px_hsl(var(--background)/0.30)] transition-colors duration-200 hover:border-primary/45 hover:bg-background/75 md:p-6 [content-visibility:auto] [contain-intrinsic-size:240px]"
                    >
                      <div className="flex items-center gap-3">
                        <span className="inline-flex h-9 min-w-9 items-center justify-center rounded-full bg-primary/20 px-2 text-sm font-display text-primary transition-colors duration-300 group-hover:bg-primary/30">
                          {rule.id}
                        </span>
                        <h4 className="font-display text-xl md:text-2xl">{rule.title}</h4>
                      </div>
                      <p className="mt-3 text-muted-foreground leading-8">{rule.description}</p>
                    </article>
                  ))}
                </div>

                <div className="mt-6 rounded-xl border border-primary/35 bg-primary/10 p-4">
                  <p className="font-display text-lg">هي قوانين المتجر</p>
                  <p className="mt-2 text-sm leading-7 text-muted-foreground">
                    يجب على جميع المشترين الالتزام بهذه القوانين لضمان تجربة شرائية آمنة وعادلة للجميع.
                  </p>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default JusticePage;

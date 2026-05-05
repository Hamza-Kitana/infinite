import { useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "ic_about_page_content_v1";
const EVENT_NAME = "ic-about-page-content";

export type AboutPillar = {
  title: string;
  body: string;
};

export type AboutPageContent = {
  heroEyebrow: string;
  heroTitleA: string;
  heroTitleB: string;
  aboutEyebrow: string;
  aboutTitle: string;
  aboutBody: string;
  visionTitle: string;
  visionBody: string;
  workTitle: string;
  workBody: string;
  featuresTitle: string;
  featuresSubtitle: string;
  pillars: AboutPillar[];
  discordTitle: string;
  discordBody: string;
  discordButtonLabel: string;
  discordFootnote: string;
  ctaTitle: string;
  ctaBody: string;
  ctaButtonLabel: string;
};

type AboutPagePersisted = {
  v: 1;
  content: AboutPageContent;
};

export function defaultAboutPageContent(): AboutPageContent {
  return {
    heroEyebrow: "WHO WE ARE",
    heroTitleA: "من",
    heroTitleB: "نحن",
    aboutEyebrow: "من نحن",
    aboutTitle: "Infinite City RP",
    aboutBody:
      "نحن فريق ومجتمع يجمع حول مدينة رول بلاي عربية طموحة: قوانين واضحة، وزارات ومؤسسات، وشوارع مليئة بالقصص. هدفنا أن تكون كل جلسة قريبة من الواقع الترفيهي — احترام للقصة، ولللاعب، وللوقت الذي يقضيه الجميع هنا.",
    visionTitle: "رؤيتنا",
    visionBody: "مدينة متجددة يتحكم فيها اللاعبون بقراراتهم، ضمن إطار RP محترم — حيث الإدارة تضع الإطار والمجتمع يملأه بالحياة.",
    workTitle: "كيف نعمل",
    workBody: "قنوات رسمية للتقديم والدعم، وجولة قوانين موحّدة للجميع. نؤمن بالشفافية: تعرف اللاعب ما المتوقع قبل أن يخطو داخل المدينة.",
    featuresTitle: "ما الذي يميّزنا",
    featuresSubtitle: "ثلاثة محاور نبني عليها تجربة المدينة يوماً بعد يوم.",
    pillars: [
      {
        title: "تجربة RP عميقة",
        body: "قصص، أدوار، ومؤسسات تعطي كل جلسة معنى — من المواطن البسيط إلى القطاعات الحكومية والعصابات.",
      },
      {
        title: "مجتمع واعٍ",
        body: "لاعبون يحترمون القوانين والقصة؛ الإدارة تعمل على بيئة عادلة، شفافة، وقريبة من اللاعبين.",
      },
      {
        title: "دعم وفريق",
        body: "نسعى لأن تكون المدينة مساحة مريحة للعب الجاد مع مسارات واضحة للانضمام والمتابعة.",
      },
    ],
    discordTitle: "تواصل معنا عبر الديسكورد",
    discordBody: "السيرفر هو نقطة التقاء اللاعبين والإدارة: تقديم الطلبات، المقابلات، الدعم، والإعلانات. انضم للمجتمع الرسمي وابقَ على اطلاع بكل جديد.",
    discordButtonLabel: "انضم إلى سيرفر الديسكورد",
    discordFootnote:
      "الفريق متواجد يومياً؛ وقت الرد قد يختلف حسب الضغط. للاستفسارات العاجلة استخدم القنوات المعتمدة داخل السيرفر بعد الانضمام.",
    ctaTitle: "جديد وتريد الانضمام؟",
    ctaBody: "ابدأ بتعبئة طلب المواطن أو القطاع المناسب؛ بعد الإرسال ستجد تعليمات المتابعة على الديسكورد.",
    ctaButtonLabel: "قدّم طلبك الآن",
  };
}

function normalize(raw: unknown): AboutPageContent {
  const base = defaultAboutPageContent();
  if (!raw || typeof raw !== "object") return base;
  const p = raw as Partial<AboutPageContent>;
  const nextPillars = Array.isArray(p.pillars)
    ? p.pillars
        .slice(0, 3)
        .map((x, idx) => ({
          title: typeof x?.title === "string" ? x.title : base.pillars[idx]?.title ?? "",
          body: typeof x?.body === "string" ? x.body : base.pillars[idx]?.body ?? "",
        }))
    : base.pillars;

  while (nextPillars.length < 3) {
    nextPillars.push(base.pillars[nextPillars.length]);
  }

  return {
    heroEyebrow: typeof p.heroEyebrow === "string" ? p.heroEyebrow : base.heroEyebrow,
    heroTitleA: typeof p.heroTitleA === "string" ? p.heroTitleA : base.heroTitleA,
    heroTitleB: typeof p.heroTitleB === "string" ? p.heroTitleB : base.heroTitleB,
    aboutEyebrow: typeof p.aboutEyebrow === "string" ? p.aboutEyebrow : base.aboutEyebrow,
    aboutTitle: typeof p.aboutTitle === "string" ? p.aboutTitle : base.aboutTitle,
    aboutBody: typeof p.aboutBody === "string" ? p.aboutBody : base.aboutBody,
    visionTitle: typeof p.visionTitle === "string" ? p.visionTitle : base.visionTitle,
    visionBody: typeof p.visionBody === "string" ? p.visionBody : base.visionBody,
    workTitle: typeof p.workTitle === "string" ? p.workTitle : base.workTitle,
    workBody: typeof p.workBody === "string" ? p.workBody : base.workBody,
    featuresTitle: typeof p.featuresTitle === "string" ? p.featuresTitle : base.featuresTitle,
    featuresSubtitle: typeof p.featuresSubtitle === "string" ? p.featuresSubtitle : base.featuresSubtitle,
    pillars: nextPillars,
    discordTitle: typeof p.discordTitle === "string" ? p.discordTitle : base.discordTitle,
    discordBody: typeof p.discordBody === "string" ? p.discordBody : base.discordBody,
    discordButtonLabel: typeof p.discordButtonLabel === "string" ? p.discordButtonLabel : base.discordButtonLabel,
    discordFootnote: typeof p.discordFootnote === "string" ? p.discordFootnote : base.discordFootnote,
    ctaTitle: typeof p.ctaTitle === "string" ? p.ctaTitle : base.ctaTitle,
    ctaBody: typeof p.ctaBody === "string" ? p.ctaBody : base.ctaBody,
    ctaButtonLabel: typeof p.ctaButtonLabel === "string" ? p.ctaButtonLabel : base.ctaButtonLabel,
  };
}

export function loadAboutPageContent(): AboutPageContent {
  if (typeof window === "undefined") return defaultAboutPageContent();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultAboutPageContent();
    const parsed = JSON.parse(raw) as AboutPagePersisted | AboutPageContent;
    if (parsed && typeof parsed === "object" && "content" in parsed) {
      return normalize((parsed as AboutPagePersisted).content);
    }
    return normalize(parsed);
  } catch {
    return defaultAboutPageContent();
  }
}

export function saveAboutPageContent(content: AboutPageContent) {
  if (typeof window === "undefined") return;
  const payload: AboutPagePersisted = { v: 1, content };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  window.dispatchEvent(new CustomEvent(EVENT_NAME));
}

export function useAboutPageContent() {
  const [content, setContent] = useState<AboutPageContent>(() => loadAboutPageContent());

  useEffect(() => {
    const sync = () => setContent(loadAboutPageContent());
    window.addEventListener("storage", sync);
    window.addEventListener(EVENT_NAME, sync as EventListener);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener(EVENT_NAME, sync as EventListener);
    };
  }, []);

  return useMemo(() => content, [content]);
}

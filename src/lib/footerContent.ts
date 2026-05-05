import { useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "ic_footer_content_v1";
const EVENT_NAME = "ic-footer-content";

export type FooterQuickLink = {
  id: string;
  label: string;
  to: string;
};

export type FooterContent = {
  quickLinksTitle: string;
  quickLinks: FooterQuickLink[];
  contactTitle: string;
  contactBody: string;
  discordLabel: string;
  discordUrl: string;
  rightsText: string;
  madeWithText: string;
  developerLabel: string;
  developerName: string;
  developerUrl: string;
};

type FooterPersisted = {
  v: 1;
  content: FooterContent;
};

function defaultQuickLinks(): FooterQuickLink[] {
  return [
    { id: crypto.randomUUID(), label: "الرئيسية", to: "/" },
    { id: crypto.randomUUID(), label: "القوانين", to: "/laws" },
    { id: crypto.randomUUID(), label: "صنّاع المحتوى", to: "/streamers" },
    { id: crypto.randomUUID(), label: "من نحن", to: "/contact" },
    { id: crypto.randomUUID(), label: "تقديم طلب", to: "/apply/citizen" },
  ];
}

export function defaultFooterContent(): FooterContent {
  return {
    quickLinksTitle: "تصفح سريع",
    quickLinks: defaultQuickLinks(),
    contactTitle: "تواصل",
    contactBody: "انضم لسيرفر الديسكورد للمقابلات، الدعم، وآخر الأخبار.",
    discordLabel: "ديسكورد",
    discordUrl: "https://discord.gg/infinitecity",
    rightsText: "جميع الحقوق محفوظة",
    madeWithText: "صُنع بعناية لمجتمع إنفينيتي سيتي",
    developerLabel: "المبرمج",
    developerName: "Hamza Kitana",
    developerUrl: "https://hamza-kitana.vercel.app/",
  };
}

function normalize(raw: unknown): FooterContent {
  const base = defaultFooterContent();
  if (!raw || typeof raw !== "object") return base;
  const p = raw as Partial<FooterContent>;
  const quickLinks = Array.isArray(p.quickLinks)
    ? p.quickLinks
        .filter((x): x is Partial<FooterQuickLink> => !!x && typeof x === "object")
        .map((x) => ({
          id: typeof x.id === "string" && x.id.trim() ? x.id : crypto.randomUUID(),
          label: typeof x.label === "string" ? x.label : "",
          to: typeof x.to === "string" ? x.to : "",
        }))
        .filter((x) => x.label.trim() && x.to.trim())
    : base.quickLinks;

  return {
    quickLinksTitle: typeof p.quickLinksTitle === "string" ? p.quickLinksTitle : base.quickLinksTitle,
    quickLinks: quickLinks.length ? quickLinks : base.quickLinks,
    contactTitle: typeof p.contactTitle === "string" ? p.contactTitle : base.contactTitle,
    contactBody: typeof p.contactBody === "string" ? p.contactBody : base.contactBody,
    discordLabel: typeof p.discordLabel === "string" ? p.discordLabel : base.discordLabel,
    discordUrl: typeof p.discordUrl === "string" ? p.discordUrl : base.discordUrl,
    rightsText: typeof p.rightsText === "string" ? p.rightsText : base.rightsText,
    madeWithText: typeof p.madeWithText === "string" ? p.madeWithText : base.madeWithText,
    developerLabel: typeof p.developerLabel === "string" ? p.developerLabel : base.developerLabel,
    developerName: typeof p.developerName === "string" ? p.developerName : base.developerName,
    developerUrl: typeof p.developerUrl === "string" ? p.developerUrl : base.developerUrl,
  };
}

export function loadFooterContent(): FooterContent {
  if (typeof window === "undefined") return defaultFooterContent();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultFooterContent();
    const parsed = JSON.parse(raw) as FooterPersisted | FooterContent;
    if (parsed && typeof parsed === "object" && "content" in parsed) {
      return normalize((parsed as FooterPersisted).content);
    }
    return normalize(parsed);
  } catch {
    return defaultFooterContent();
  }
}

export function saveFooterContent(content: FooterContent) {
  if (typeof window === "undefined") return;
  const payload: FooterPersisted = { v: 1, content };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  window.dispatchEvent(new CustomEvent(EVENT_NAME));
}

export function useFooterContent() {
  const [content, setContent] = useState<FooterContent>(() => loadFooterContent());

  useEffect(() => {
    const sync = () => setContent(loadFooterContent());
    window.addEventListener("storage", sync);
    window.addEventListener(EVENT_NAME, sync as EventListener);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener(EVENT_NAME, sync as EventListener);
    };
  }, []);

  return useMemo(() => content, [content]);
}

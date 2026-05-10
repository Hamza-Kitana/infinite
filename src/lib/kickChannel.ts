/** استخراج اسم القناة (slug) من رابط Kick — يدعم kick.com/username ومع مسارات إضافية */

export function parseKickSlugFromUrl(url: string): string | null {
  const trimmed = url.trim();
  if (!trimmed) return null;
  try {
    const u = new URL(trimmed.startsWith("http") ? trimmed : `https://${trimmed}`);
    const host = u.hostname.replace(/^www\./i, "").toLowerCase();
    if (host !== "kick.com") return null;
    const segments = u.pathname.replace(/^\//, "").split("/").filter(Boolean);
    if (segments.length === 0) return null;
    const first = segments[0];
    const skip = new Set(["video", "clips", "categories", "browse", "dashboard", "settings"]);
    if (skip.has(first.toLowerCase())) return null;
    const slug = first;
    if (!/^[a-zA-Z0-9_-]+$/.test(slug)) return null;
    return slug.toLowerCase();
  } catch {
    return null;
  }
}

/** استجابة مختصرة من kick.com/api/v2/channels/:slug */
export type KickChannelLiveInfo = {
  live: boolean;
  /** عنوان البث إن وُجد */
  sessionTitle?: string;
  /** false إذا فشل الاتصال — لا نعرض «أوفلاين» بثقة */
  fetchOk: boolean;
};

type KickApiLivestream = Record<string, unknown> | null;

function pickTitle(ls: KickApiLivestream): string | undefined {
  if (!ls || typeof ls !== "object") return undefined;
  const st = ls.session_title;
  if (typeof st === "string" && st.trim()) return st.trim();
  const st2 = ls.stream_title;
  if (typeof st2 === "string" && st2.trim()) return st2.trim();
  return undefined;
}

export function liveInfoFromKickPayload(payload: unknown): KickChannelLiveInfo {
  if (!payload || typeof payload !== "object") return { live: false, fetchOk: true };
  const livestream = (payload as { livestream?: KickApiLivestream }).livestream;
  const live = livestream != null && typeof livestream === "object";
  return { live, sessionTitle: live ? pickTitle(livestream) : undefined, fetchOk: true };
}

/**
 * افتراضياً نفس المنشأ `/kick-api` — يعمل مع بروكسي Vite محلياً، ومع `public/_redirects` (Netlify)
 * أو `vercel.json` على الإنتاج. لا تستخدم `https://kick.com` مباشرة من المتصفّح غالباً بسبب CORS.
 * لتجاوز يدوي: VITE_KICK_API_BASE=https://خادمك-البروكسي
 */
export function getKickApiOrigin(): string {
  const fromEnv = import.meta.env.VITE_KICK_API_BASE as string | undefined;
  if (fromEnv?.trim()) return fromEnv.trim().replace(/\/$/, "");
  return "/kick-api";
}

function looksLikeKickChannelJson(json: unknown): boolean {
  if (!json || typeof json !== "object") return false;
  const o = json as Record<string, unknown>;
  return typeof o.slug === "string" || typeof o.user_id === "number" || "livestream" in o;
}

async function fetchKickOnce(slug: string, signal?: AbortSignal): Promise<KickChannelLiveInfo> {
  const origin = getKickApiOrigin();
  const url = `${origin}/api/v2/channels/${encodeURIComponent(slug)}`;
  const res = await fetch(url, {
    signal,
    credentials: "omit",
    headers: {
      Accept: "application/json",
    },
  });
  if (!res.ok) return { live: false, fetchOk: false };
  let json: unknown;
  try {
    json = await res.json();
  } catch {
    return { live: false, fetchOk: false };
  }
  if (!looksLikeKickChannelJson(json)) return { live: false, fetchOk: false };
  return liveInfoFromKickPayload(json);
}

function delay(ms: number) {
  return new Promise<void>((r) => window.setTimeout(r, ms));
}

export async function fetchKickChannelLive(slug: string, signal?: AbortSignal): Promise<KickChannelLiveInfo> {
  const attempts = [0, 400, 900];
  let last: KickChannelLiveInfo = { live: false, fetchOk: false };
  for (let i = 0; i < attempts.length; i++) {
    if (signal?.aborted) return last;
    if (attempts[i] > 0) await delay(attempts[i]);
    try {
      last = await fetchKickOnce(slug, signal);
      if (last.fetchOk) return last;
    } catch {
      last = { live: false, fetchOk: false };
    }
  }
  return last;
}

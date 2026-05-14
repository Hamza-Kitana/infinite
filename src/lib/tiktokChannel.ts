/** استخراج اسم المستخدم (uniqueId) من رابط TikTok — يدعم tiktok.com و vm.tiktok.com */

export function parseTikTokUniqueIdFromUrl(url: string): string | null {
  const trimmed = url.trim();
  if (!trimmed) return null;
  try {
    const u = new URL(trimmed.startsWith("http") ? trimmed : `https://${trimmed}`);
    const host = u.hostname.replace(/^www\./i, "").toLowerCase();
    if (host !== "tiktok.com" && host !== "vm.tiktok.com") return null;
    const m = u.pathname.match(/@([^/?#]+)/);
    if (!m?.[1]) return null;
    const id = decodeURIComponent(m[1]).trim();
    if (!id || id.length > 64) return null;
    return id;
  } catch {
    return null;
  }
}

export type TikTokChannelLiveInfo = {
  live: boolean;
  /** معرّف الغرفة عند البث — للمعاينة عبر مشغّل TikTok */
  roomId?: string;
  sessionTitle?: string;
  fetchOk: boolean;
};

function extractHydrationObject(html: string): unknown | null {
  const marker = '<script id="__UNIVERSAL_DATA_FOR_REHYDRATION__"';
  const i = html.indexOf(marker);
  if (i === -1) return null;
  const gt = html.indexOf(">", i + marker.length);
  if (gt === -1) return null;
  const end = html.indexOf("</script>", gt + 1);
  if (end === -1) return null;
  const jsonText = html.slice(gt + 1, end).trim();
  if (!jsonText) return null;
  try {
    return JSON.parse(jsonText) as unknown;
  } catch {
    return null;
  }
}

function pickLiveTitleFromLiveRoom(liveRoom: unknown): string | undefined {
  if (!liveRoom || typeof liveRoom !== "object") return undefined;
  const o = liveRoom as Record<string, unknown>;
  for (const k of ["title", "roomTitle", "stream_title", "name"]) {
    const v = o[k];
    if (typeof v === "string" && v.trim()) return v.trim();
  }
  return undefined;
}

export function liveInfoFromTikTokProfileHydration(payload: unknown): TikTokChannelLiveInfo {
  if (!payload || typeof payload !== "object") return { live: false, fetchOk: false };
  const root = payload as Record<string, unknown>;
  const scope = root.__DEFAULT_SCOPE__;
  if (!scope || typeof scope !== "object") return { live: false, fetchOk: false };
  const detail = (scope as Record<string, unknown>)["webapp.user-detail"];
  if (!detail || typeof detail !== "object") return { live: false, fetchOk: false };
  const d = detail as Record<string, unknown>;
  const code = d.statusCode;
  if (typeof code === "number" && code !== 0) {
    return { live: false, fetchOk: false };
  }
  const userInfo = d.userInfo;
  if (!userInfo || typeof userInfo !== "object") return { live: false, fetchOk: true };
  const user = (userInfo as Record<string, unknown>).user;
  if (!user || typeof user !== "object") return { live: false, fetchOk: true };
  const u = user as Record<string, unknown>;
  const roomRaw = u.roomId;
  const roomId =
    typeof roomRaw === "string" && /^[0-9]+$/.test(roomRaw.trim()) ? roomRaw.trim() : undefined;
  const live = Boolean(roomId);
  const lr = u.liveRoom;
  const sessionTitle = pickLiveTitleFromLiveRoom(lr);
  return { live, roomId, sessionTitle, fetchOk: true };
}

/**
 * افتراضياً `/tiktok-api` — بروكسي Vite محلياً، و `vercel.json` / `public/_redirects` في الإنتاج.
 * لا تستخدم `https://www.tiktok.com` مباشرة من المتصفّح بسبب CORS.
 */
export function getTikTokPageOrigin(): string {
  const fromEnv = import.meta.env.VITE_TIKTOK_PAGE_BASE as string | undefined;
  if (fromEnv?.trim()) return fromEnv.trim().replace(/\/$/, "");
  return "/tiktok-api";
}

async function fetchTikTokProfileOnce(uniqueId: string, signal?: AbortSignal): Promise<TikTokChannelLiveInfo> {
  const origin = getTikTokPageOrigin();
  const url = `${origin}/@${encodeURIComponent(uniqueId)}`;
  const res = await fetch(url, {
    signal,
    credentials: "omit",
    headers: {
      Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      "Accept-Language": "en-US,en;q=0.9,ar;q=0.8",
      Referer: "https://www.tiktok.com/",
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
    },
  });
  if (!res.ok) return { live: false, fetchOk: false };
  let html: string;
  try {
    html = await res.text();
  } catch {
    return { live: false, fetchOk: false };
  }
  if (!html.includes("__UNIVERSAL_DATA_FOR_REHYDRATION__")) {
    return { live: false, fetchOk: false };
  }
  const json = extractHydrationObject(html);
  if (!json) return { live: false, fetchOk: false };
  return liveInfoFromTikTokProfileHydration(json);
}

function delay(ms: number) {
  return new Promise<void>((r) => window.setTimeout(r, ms));
}

export async function fetchTikTokChannelLive(
  uniqueId: string,
  signal?: AbortSignal,
): Promise<TikTokChannelLiveInfo> {
  const attempts = [0, 500, 1100];
  let last: TikTokChannelLiveInfo = { live: false, fetchOk: false };
  for (let i = 0; i < attempts.length; i++) {
    if (signal?.aborted) return last;
    if (attempts[i] > 0) await delay(attempts[i]);
    try {
      last = await fetchTikTokProfileOnce(uniqueId, signal);
      if (last.fetchOk) return last;
    } catch {
      last = { live: false, fetchOk: false };
    }
  }
  return last;
}

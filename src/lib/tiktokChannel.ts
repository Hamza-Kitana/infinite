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
  const markers = [
    '<script id="__UNIVERSAL_DATA_FOR_REHYDRATION__"',
    "<script id='__UNIVERSAL_DATA_FOR_REHYDRATION__'",
    '<script id=__UNIVERSAL_DATA_FOR_REHYDRATION__',
  ];
  let i = -1;
  let markerLen = 0;
  for (const m of markers) {
    const at = html.indexOf(m);
    if (at !== -1) {
      i = at;
      markerLen = m.length;
      break;
    }
  }
  if (i === -1) return null;
  const gt = html.indexOf(">", i + markerLen);
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

function normalizeRoomId(raw: unknown): string | undefined {
  if (raw === null || raw === undefined) return undefined;
  if (typeof raw === "number" && Number.isFinite(raw) && raw > 0) {
    return String(Math.floor(raw));
  }
  if (typeof raw === "string") {
    const t = raw.trim();
    if (/^[0-9]+$/.test(t)) return t;
  }
  return undefined;
}

function pickRoomIdFromUserRecord(u: Record<string, unknown>): string | undefined {
  const direct = normalizeRoomId(u.roomId) ?? normalizeRoomId(u.room_id);
  if (direct) return direct;
  const lr = u.liveRoom;
  if (!lr || typeof lr !== "object") return undefined;
  const L = lr as Record<string, unknown>;
  return (
    normalizeRoomId(L.roomId) ??
    normalizeRoomId(L.room_id) ??
    normalizeRoomId(L.id) ??
    normalizeRoomId(L.RoomId)
  );
}

/** إن وُجد roomId في HTML لكن المسار داخل JSON تغيّر — بحث ضيق لتفادي أرقام عشوائية */
function scrapeRoomIdFromProfileHtml(html: string): string | undefined {
  const patterns = [
    /"roomId"\s*:\s*"([0-9]{6,24})"/,
    /"room_id"\s*:\s*"([0-9]{6,24})"/,
    /"roomId"\s*:\s*([0-9]{6,24})\b/,
    /\\"roomId\\":\\"([0-9]{6,24})\\"/,
  ];
  for (const p of patterns) {
    const m = html.match(p);
    if (m?.[1]) return m[1];
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
  const roomId = pickRoomIdFromUserRecord(u);
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
  const parsed = liveInfoFromTikTokProfileHydration(json);
  if (!parsed.fetchOk) return parsed;
  if (parsed.live && parsed.roomId) return parsed;
  const scraped = scrapeRoomIdFromProfileHtml(html);
  if (scraped) {
    return {
      live: true,
      roomId: scraped,
      sessionTitle: parsed.sessionTitle,
      fetchOk: true,
    };
  }
  return parsed;
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

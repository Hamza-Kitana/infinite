/** يستخرج معرف فيديو يوتيوب من معرف بحته أو من رابط youtube.com / youtu.be */
export function parseYoutubeVideoId(raw: string): string | null {
  const s = raw.trim();
  if (!s) return null;
  if (/^[\w-]{11}$/.test(s)) return s;
  try {
    const normalized = s.includes("://") ? s : `https://${s}`;
    const u = new URL(normalized);
    if (u.hostname.replace(/^www\./, "") === "youtu.be") {
      const id = u.pathname.replace(/^\//, "").slice(0, 11);
      return /^[\w-]{11}$/.test(id) ? id : null;
    }
    if (u.hostname.includes("youtube.com")) {
      const v = u.searchParams.get("v");
      if (v && /^[\w-]{11}$/.test(v)) return v;
      const embed = u.pathname.match(/\/embed\/([\w-]{11})/);
      if (embed?.[1]) return embed[1];
      const shorts = u.pathname.match(/\/shorts\/([\w-]{11})/);
      if (shorts?.[1]) return shorts[1];
    }
  } catch {
    /* invalid URL */
  }
  return null;
}

function youtubeOriginParam(): string {
  if (typeof window === "undefined") return "";
  try {
    return window.location.origin;
  } catch {
    return "";
  }
}

/**
 * رابط تضمين يوتيوب مع تفعيل JS API لطلب أعلى جودة تشغيل متاحة عبر postMessage
 * (لا يضمن يوتيوب جودة ثابتة — يعتمد على الفيديو والشبكة وسياسة المنصة).
 */
export function youtubeEmbedUrl(videoId: string): string {
  const q = new URLSearchParams({
    rel: "0",
    modestbranding: "1",
    playsinline: "1",
    enablejsapi: "1",
  });
  const origin = youtubeOriginParam();
  if (origin) q.set("origin", origin);
  return `https://www.youtube-nocookie.com/embed/${encodeURIComponent(videoId)}?${q}`;
}

function postYoutubePlayerMessage(contentWindow: Window, func: string, args: unknown[] = []): void {
  contentWindow.postMessage(JSON.stringify({ event: "command", func, args }), "*");
}

/**
 * يطلب من مشغّل التضمين أعلى جودة متاحة (highres ثم احتياطيات شائعة).
 * يُستدعى بعد تحميل الـ iframe و/أو مع إعادة المحاولة بزمن قصير.
 */
export function boostYoutubePlayerQuality(contentWindow: Window | null | undefined): void {
  if (!contentWindow) return;
  postYoutubePlayerMessage(contentWindow, "setPlaybackQuality", ["highres"]);
  postYoutubePlayerMessage(contentWindow, "setPlaybackQuality", ["hd1080"]);
  postYoutubePlayerMessage(contentWindow, "setPlaybackQualityRange", ["highres", "highres"]);
}

/** إعادة طلب الجودة بعد فواصل — يزيد فرص نجاح الأمر بعد تهيئة المشغّل */
export function scheduleBoostYoutubePlayerQuality(iframe: HTMLIFrameElement | null): void {
  if (!iframe?.contentWindow) return;
  const w = iframe.contentWindow;
  const run = () => boostYoutubePlayerQuality(w);
  run();
  window.setTimeout(run, 450);
  window.setTimeout(run, 1400);
  window.setTimeout(run, 3000);
}

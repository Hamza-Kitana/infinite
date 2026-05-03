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

export function youtubeEmbedUrl(videoId: string): string {
  const q = new URLSearchParams({
    rel: "0",
    modestbranding: "1",
    playsinline: "1",
  });
  return `https://www.youtube-nocookie.com/embed/${encodeURIComponent(videoId)}?${q}`;
}

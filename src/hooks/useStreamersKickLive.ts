import { useEffect, useState } from "react";
import type { StreamerEntry } from "@/types/streamersSchema";
import { fetchKickChannelLive, parseKickSlugFromUrl, type KickChannelLiveInfo } from "@/lib/kickChannel";

const POLL_MS = 60_000;

export type StreamerKickLiveMap = Record<string, KickChannelLiveInfo>;

/** يحدّث حالة البث من Kick لكل صانع محتوى يملك رابط kick.com */
export function useStreamersKickLive(items: StreamerEntry[]): StreamerKickLiveMap {
  const [map, setMap] = useState<StreamerKickLiveMap>({});

  useEffect(() => {
    const jobs = items.flatMap((it) => {
      const slug = parseKickSlugFromUrl(it.streamUrl);
      return slug ? [{ id: it.id, slug }] : [];
    });

    if (jobs.length === 0) {
      setMap({});
      return;
    }

    let cancelled = false;
    const ac = new AbortController();

    async function run() {
      const next: StreamerKickLiveMap = {};
      await Promise.all(
        jobs.map(async ({ id, slug }) => {
          const info = await fetchKickChannelLive(slug, ac.signal);
          if (cancelled) return;
          next[id] = info;
        }),
      );
      if (!cancelled) setMap(next);
    }

    void run();
    const intervalId = window.setInterval(() => void run(), POLL_MS);

    return () => {
      cancelled = true;
      ac.abort();
      window.clearInterval(intervalId);
    };
  }, [items]);

  return map;
}

export function countLiveStreamers(liveMap: StreamerKickLiveMap): number {
  return Object.values(liveMap).filter((x) => x.live).length;
}

import { useEffect, useState } from "react";
import type { StreamerEntry } from "@/types/streamersSchema";
import {
  fetchTikTokChannelLive,
  parseTikTokUniqueIdFromUrl,
  type TikTokChannelLiveInfo,
} from "@/lib/tiktokChannel";

const POLL_MS = 60_000;

export type StreamerTikTokLiveMap = Record<string, TikTokChannelLiveInfo>;

/** يحدّث حالة البث من TikTok لكل صانع محتوى يملك رابط tiktok.com أو vm.tiktok.com */
export function useStreamersTikTokLive(items: StreamerEntry[]): StreamerTikTokLiveMap {
  const [map, setMap] = useState<StreamerTikTokLiveMap>({});

  useEffect(() => {
    const jobs = items.flatMap((it) => {
      const uid = parseTikTokUniqueIdFromUrl(it.streamUrl);
      return uid ? [{ id: it.id, uid }] : [];
    });

    if (jobs.length === 0) {
      setMap({});
      return;
    }

    let cancelled = false;
    const ac = new AbortController();

    async function run() {
      const next: StreamerTikTokLiveMap = {};
      await Promise.all(
        jobs.map(async ({ id, uid }) => {
          const info = await fetchTikTokChannelLive(uid, ac.signal);
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

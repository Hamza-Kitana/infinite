import { getOrderedSeed } from "@/data/streamersSeed";
import type { StreamerEntry, StreamersPersisted } from "@/types/streamersSchema";

export function buildDefaultStreamers(): StreamerEntry[] {
  const ordered = getOrderedSeed();
  return ordered.map((s, i) => ({
    id: `s-${i}`,
    name: s.name,
    role: s.role,
    bio: s.bio,
    streamUrl: s.streamUrl,
    image: s.image,
  }));
}

export function defaultStreamersPersisted(): StreamersPersisted {
  return { v: 1, items: buildDefaultStreamers() };
}

/** القائمة الأولية — فارغة؛ تُعبّأ من لوحة الإدارة */
export type StreamerSeedRow = {
  name: string;
  role: string;
  bio: string;
  streamUrl: string;
  image: string;
};

export const STREAMERS_SEED: StreamerSeedRow[] = [];

export function getOrderedSeed(): StreamerSeedRow[] {
  return [...STREAMERS_SEED];
}

import { GANGS_SEED } from "@/data/gangsSeed";
import type { GangsPersisted } from "@/types/gangsSchema";

export function defaultGangsPersisted(): GangsPersisted {
  return { v: 2, gangs: GANGS_SEED.map((g) => ({ ...g, profilePoints: [...g.profilePoints] })) };
}

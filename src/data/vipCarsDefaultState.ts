import type { VipCatalogCar } from "@/data/vipCarsCatalog";
import { vipCarsCatalog } from "@/data/vipCarsCatalog";

export type VipCarsPersisted = {
  v: 1;
  cars: VipCatalogCar[];
};

export function defaultVipCarsPersisted(): VipCarsPersisted {
  return { v: 1, cars: JSON.parse(JSON.stringify(vipCarsCatalog)) as VipCatalogCar[] };
}

import type { HouseCatalogItem } from "@/data/housesCatalog";
import { housesCatalog } from "@/data/housesCatalog";

export type HousesPersisted = {
  v: 2;
  houses: HouseCatalogItem[];
};

export function defaultHousesPersisted(): HousesPersisted {
  return { v: 2, houses: JSON.parse(JSON.stringify(housesCatalog)) as HouseCatalogItem[] };
}

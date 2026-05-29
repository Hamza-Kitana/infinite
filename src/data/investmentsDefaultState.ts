import type { InvestmentCatalogItem } from "@/data/investmentsCatalog";
import { investmentsCatalog } from "@/data/investmentsCatalog";

export type InvestmentsPersisted = {
  v: 2;
  investments: InvestmentCatalogItem[];
};

export function defaultInvestmentsPersisted(): InvestmentsPersisted {
  return {
    v: 2,
    investments: JSON.parse(JSON.stringify(investmentsCatalog)) as InvestmentCatalogItem[],
  };
}

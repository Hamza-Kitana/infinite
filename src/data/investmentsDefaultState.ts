import type { InvestmentCatalogItem } from "@/data/investmentsCatalog";
import { investmentsCatalog } from "@/data/investmentsCatalog";

export type InvestmentsPersisted = {
  v: 1;
  investments: InvestmentCatalogItem[];
};

export function defaultInvestmentsPersisted(): InvestmentsPersisted {
  return {
    v: 1,
    investments: JSON.parse(JSON.stringify(investmentsCatalog)) as InvestmentCatalogItem[],
  };
}

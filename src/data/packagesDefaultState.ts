import type { PackageCatalogItem } from "@/data/packagesCatalog";
import { packagesCatalog } from "@/data/packagesCatalog";

export type PackagesPersisted = {
  v: 2;
  packages: PackageCatalogItem[];
};

export function defaultPackagesPersisted(): PackagesPersisted {
  return { v: 2, packages: JSON.parse(JSON.stringify(packagesCatalog)) as PackageCatalogItem[] };
}

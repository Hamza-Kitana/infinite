import type { PackageCatalogItem } from "@/data/packagesCatalog";
import { packagesCatalog } from "@/data/packagesCatalog";

export type PackagesPersisted = {
  v: 1;
  packages: PackageCatalogItem[];
};

export function defaultPackagesPersisted(): PackagesPersisted {
  return { v: 1, packages: JSON.parse(JSON.stringify(packagesCatalog)) as PackageCatalogItem[] };
}

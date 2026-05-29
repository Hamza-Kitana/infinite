import { useEffect, useState } from "react";
import { listenStorageSync, writeSyncedLocalStorage } from "@/lib/storageSync";

const STORAGE_KEY = "ic_site_maintenance_v1";
export const SITE_MAINTENANCE_EVENT = "ic-site-maintenance";

export type SiteMaintenanceState = {
  v: 1;
  active: boolean;
  since?: string;
};

function defaultState(): SiteMaintenanceState {
  return { v: 1, active: false };
}

function parse(raw: string | null): SiteMaintenanceState {
  if (!raw) return defaultState();
  try {
    const p = JSON.parse(raw) as Partial<SiteMaintenanceState>;
    if (p?.v === 1 && typeof p.active === "boolean") {
      return { v: 1, active: p.active, since: typeof p.since === "string" ? p.since : undefined };
    }
  } catch {
    /* ignore */
  }
  return defaultState();
}

export function readSiteMaintenance(): SiteMaintenanceState {
  return parse(localStorage.getItem(STORAGE_KEY));
}

export function setSiteMaintenanceActive(active: boolean): SiteMaintenanceState {
  const next: SiteMaintenanceState = active
    ? { v: 1, active: true, since: new Date().toISOString() }
    : { v: 1, active: false };
  writeSyncedLocalStorage(STORAGE_KEY, JSON.stringify(next), [SITE_MAINTENANCE_EVENT]);
  return next;
}

export function useSiteMaintenance(): SiteMaintenanceState {
  const [state, setState] = useState<SiteMaintenanceState>(() => readSiteMaintenance());

  useEffect(() => {
    const sync = () => setState(readSiteMaintenance());
    return listenStorageSync(STORAGE_KEY, sync, [SITE_MAINTENANCE_EVENT]);
  }, []);

  return state;
}

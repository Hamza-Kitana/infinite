export type AdminDashboardTheme = "light" | "dark";

const STORAGE_KEY = "ic_admin_dashboard_theme";

export function readAdminDashboardTheme(): AdminDashboardTheme {
  if (typeof window === "undefined") return "light";
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    if (v === "dark" || v === "light") return v;
  } catch {
    /* ignore */
  }
  return "light";
}

export function persistAdminDashboardTheme(theme: AdminDashboardTheme) {
  try {
    localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    /* ignore */
  }
}

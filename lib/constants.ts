// Role home routes — single source of truth
export const ROLE_HOME_ROUTES: Record<string, string> = {
  ADMIN: "/pos",
  OWNER: "/dashboard",
  MANAGER: "/dashboard",
  SALES: "/dashboard",
  FINANCE: "/finance",
  DRAFTER: "/tasks",
  PURCHASING: "/tasks",
  OPERATOR: "/tasks",
  QC: "/tasks",
  DELIVERY: "/tasks",
  SUPERADMIN: "/superadmin",
};

// Legacy — kept for backward compat, use NAV_CONFIG from lib/nav-config.ts instead
export const BOTTOM_NAV_ITEMS: Record<string, Array<{ label: string; href: string; icon: string }>> = {
  ADMIN: [
    { label: "PO", href: "/pos", icon: "clipboard-list" },
    { label: "Board", href: "/board", icon: "layout-grid" },
    { label: "Masalah", href: "/problems", icon: "alert-circle" },
    { label: "Profil", href: "/profile", icon: "user" },
  ],
  OWNER: [
    { label: "Dashboard", href: "/dashboard", icon: "bar-chart-3" },
    { label: "Board", href: "/board", icon: "layout-grid" },
    { label: "Profil", href: "/profile", icon: "user" },
  ],
  MANAGER: [
    { label: "Dashboard", href: "/dashboard", icon: "bar-chart-3" },
    { label: "Board", href: "/board", icon: "layout-grid" },
    { label: "Profil", href: "/profile", icon: "user" },
  ],
  SALES: [
    { label: "Dashboard", href: "/dashboard", icon: "bar-chart-3" },
    { label: "Board", href: "/board", icon: "layout-grid" },
    { label: "Profil", href: "/profile", icon: "user" },
  ],
  DRAFTER: [
    { label: "Tugas", href: "/tasks", icon: "clipboard-list" },
    { label: "Board", href: "/board", icon: "layout-grid" },
    { label: "Profil", href: "/profile", icon: "user" },
  ],
  PURCHASING: [
    { label: "Tugas", href: "/tasks", icon: "clipboard-list" },
    { label: "Board", href: "/board", icon: "layout-grid" },
    { label: "Profil", href: "/profile", icon: "user" },
  ],
  OPERATOR: [
    { label: "Tugas", href: "/tasks", icon: "clipboard-list" },
    { label: "Board", href: "/board", icon: "layout-grid" },
    { label: "Profil", href: "/profile", icon: "user" },
  ],
  QC: [
    { label: "Tugas", href: "/tasks", icon: "clipboard-list" },
    { label: "Board", href: "/board", icon: "layout-grid" },
    { label: "Profil", href: "/profile", icon: "user" },
  ],
  DELIVERY: [
    { label: "Tugas", href: "/tasks", icon: "clipboard-list" },
    { label: "Board", href: "/board", icon: "layout-grid" },
    { label: "Profil", href: "/profile", icon: "user" },
  ],
  FINANCE: [
    { label: "Finance", href: "/finance", icon: "receipt" },
    { label: "Board", href: "/board", icon: "layout-grid" },
    { label: "Profil", href: "/profile", icon: "user" },
  ],
};

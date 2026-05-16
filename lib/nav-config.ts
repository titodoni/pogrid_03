import { UserRole } from "@/app/generated/prisma/browser";

type NavItem = {
  label: string;
  href: string;
  icon: string;
};

type FabItem = {
  label: string;
  href: string;
};

type NavConfig = {
  left: NavItem[];
  right: NavItem[];
  fab?: FabItem;
};

export const NAV_CONFIG: Partial<Record<UserRole, NavConfig>> = {
  ADMIN: {
    left: [
      { label: "PO", href: "/pos", icon: "clipboard-list" },
      { label: "Board", href: "/board", icon: "layout-grid" },
    ],
    fab: { label: "PO Baru", href: "/pos/new" },
    right: [
      { label: "Masalah", href: "/problems", icon: "alert-circle" },
      { label: "Profil", href: "/profile", icon: "user" },
    ],
  },
  OWNER: {
    left: [
      { label: "Dashboard", href: "/dashboard", icon: "bar-chart-3" },
    ],
    fab: { label: "Board", href: "/board" },
    right: [
      { label: "Profil", href: "/profile", icon: "user" },
    ],
  },
  MANAGER: {
    left: [
      { label: "Dashboard", href: "/dashboard", icon: "bar-chart-3" },
    ],
    fab: { label: "Board", href: "/board" },
    right: [
      { label: "Profil", href: "/profile", icon: "user" },
    ],
  },
  SALES: {
    left: [
      { label: "Dashboard", href: "/dashboard", icon: "bar-chart-3" },
    ],
    fab: { label: "Board", href: "/board" },
    right: [
      { label: "Profil", href: "/profile", icon: "user" },
    ],
  },
  DRAFTER: {
    left: [
      { label: "Masalah", href: "/problems", icon: "alert-circle" },
    ],
    fab: { label: "Tugas", href: "/tasks" },
    right: [
      { label: "Profil", href: "/profile", icon: "user" },
    ],
  },
  PURCHASING: {
    left: [
      { label: "Masalah", href: "/problems", icon: "alert-circle" },
    ],
    fab: { label: "Tugas", href: "/tasks" },
    right: [
      { label: "Profil", href: "/profile", icon: "user" },
    ],
  },
  OPERATOR: {
    left: [
      { label: "Masalah", href: "/problems", icon: "alert-circle" },
    ],
    fab: { label: "Tugas", href: "/tasks" },
    right: [
      { label: "Profil", href: "/profile", icon: "user" },
    ],
  },
  QC: {
    left: [
      { label: "Masalah", href: "/problems", icon: "alert-circle" },
    ],
    fab: { label: "Tugas", href: "/tasks" },
    right: [
      { label: "Profil", href: "/profile", icon: "user" },
    ],
  },
  DELIVERY: {
    left: [
      { label: "Masalah", href: "/problems", icon: "alert-circle" },
    ],
    fab: { label: "Tugas", href: "/tasks" },
    right: [
      { label: "Profil", href: "/profile", icon: "user" },
    ],
  },
  FINANCE: {
    left: [
      { label: "Finance", href: "/finance", icon: "receipt" },
    ],
    fab: { label: "Board", href: "/board" },
    right: [
      { label: "Profil", href: "/profile", icon: "user" },
    ],
  },
};

export const ROLE_HOME_ROUTES: Partial<Record<UserRole, string>> = {
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
};

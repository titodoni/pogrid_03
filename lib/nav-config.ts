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
      { label: "PO", href: "/po", icon: "clipboard-list" },
      { label: "Board", href: "/board", icon: "layout-grid" },
    ],
    fab: { label: "PO Baru", href: "/po/new" },
    right: [
      { label: "Masalah", href: "/problems", icon: "alert-circle" },
      { label: "Profil", href: "/profile", icon: "user" },
    ],
  },
  OWNER: {
    left: [
      { label: "Board", href: "/board", icon: "layout-grid" },
      { label: "PO", href: "/po", icon: "clipboard-list" },
    ],
    right: [
      { label: "Profil", href: "/profile", icon: "user" },
    ],
  },
  MANAGER: {
    left: [
      { label: "Board", href: "/board", icon: "layout-grid" },
      { label: "PO", href: "/po", icon: "clipboard-list" },
    ],
    right: [
      { label: "Profil", href: "/profile", icon: "user" },
    ],
  },
  SALES: {
    left: [
      { label: "Board", href: "/board", icon: "layout-grid" },
      { label: "PO", href: "/po", icon: "clipboard-list" },
    ],
    right: [
      { label: "Profil", href: "/profile", icon: "user" },
    ],
  },
  DRAFTER: {
    left: [
      { label: "PO", href: "/po", icon: "clipboard-list" },
      { label: "Masalah", href: "/problems", icon: "alert-circle" },
    ],
    fab: { label: "Tugas", href: "/tasks" },
    right: [
      { label: "Profil", href: "/profile", icon: "user" },
    ],
  },
  PURCHASING: {
    left: [
      { label: "PO", href: "/po", icon: "clipboard-list" },
      { label: "Masalah", href: "/problems", icon: "alert-circle" },
    ],
    fab: { label: "Tugas", href: "/tasks" },
    right: [
      { label: "Profil", href: "/profile", icon: "user" },
    ],
  },
  OPERATOR: {
    left: [
      { label: "PO", href: "/po", icon: "clipboard-list" },
      { label: "Masalah", href: "/problems", icon: "alert-circle" },
    ],
    fab: { label: "Tugas", href: "/tasks" },
    right: [
      { label: "Profil", href: "/profile", icon: "user" },
    ],
  },
  QC: {
    left: [
      { label: "PO", href: "/po", icon: "clipboard-list" },
      { label: "Masalah", href: "/problems", icon: "alert-circle" },
    ],
    fab: { label: "Tugas", href: "/tasks" },
    right: [
      { label: "Profil", href: "/profile", icon: "user" },
    ],
  },
  DELIVERY: {
    left: [
      { label: "PO", href: "/po", icon: "clipboard-list" },
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
      { label: "PO", href: "/po", icon: "clipboard-list" },
    ],
    right: [
      { label: "Profil", href: "/profile", icon: "user" },
    ],
  },
};

export const ROLE_HOME_ROUTES: Partial<Record<UserRole, string>> = {
  ADMIN: "/po",
  OWNER: "/board",
  MANAGER: "/board",
  SALES: "/board",
  FINANCE: "/finance",
  DRAFTER: "/tasks",
  PURCHASING: "/tasks",
  OPERATOR: "/tasks",
  QC: "/tasks",
  DELIVERY: "/tasks",
};

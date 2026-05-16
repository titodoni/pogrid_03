import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getPageTitle(pathname: string): string {
  const titles: Record<string, string> = {
    "/dashboard": "Dashboard",
    "/pos": "Production Orders",
    "/po": "Daftar PO",
    "/tasks": "Tugas",
    "/board": "Board Produksi",
    "/problems": "Masalah",
    "/finance": "Finance",
    "/settings": "Pengaturan",
    "/profile": "Profil",
  };
  return titles[pathname] || "POgrid";
}

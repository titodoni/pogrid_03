"use client";

import { ReactNode } from "react";
import { AppShell } from "@/components/app-shell";
import { UserRole } from "@/app/generated/prisma/browser";

export default function AuthenticatedLayout({ children }: { children: ReactNode }) {
  const role: UserRole | null = UserRole.ADMIN;
  
  return <AppShell role={role}>{children}</AppShell>;
}
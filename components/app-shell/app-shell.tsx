"use client";

import { usePathname } from "next/navigation";
import { ReactNode } from "react";
import { UserRole } from "@/app/generated/prisma/browser";
import { BottomNav } from "./bottom-nav";
import { TopBar } from "./top-bar";

interface AppShellProps {
  children: ReactNode;
  role?: UserRole | null;
}

export function AppShell({ children, role }: AppShellProps) {
  const pathname = usePathname();
  
  const isAuthPage = pathname === "/login" || pathname === "/superadmin";
  const isPublicPage = pathname === "/demo";
  
  if (isAuthPage || isPublicPage) {
    return <>{children}</>;
  }

  return (
    <div className="flex flex-col h-full min-h-screen bg-background">
      <TopBar />
      <main className="flex-1 overflow-y-auto pb-16 sm:pb-0">
        <div className="container mx-auto p-4 max-w-4xl">
          {children}
        </div>
      </main>
      {role && <BottomNav role={role} currentPath={pathname} />}
    </div>
  );
}
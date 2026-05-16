"use client";

import { useState, useEffect, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { UserRole } from "@/app/generated/prisma/browser";

type SessionData = {
  userId: string;
  name: string;
  role: UserRole;
  roleKey: string;
  departmentId: string | null;
  workspaceId: string;
};

export default function AuthenticatedLayout({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<SessionData | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function checkSession() {
      try {
        const res = await fetch("/api/auth/session");
        const json = await res.json();
        if (!json.ok || !json.data) {
          router.push("/login");
          return;
        }
        setSession(json.data);
      } catch {
        router.push("/login");
      } finally {
        setLoading(false);
      }
    }
    checkSession();
  }, [router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">Memuat...</p>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return <AppShell role={session.role}>{children}</AppShell>;
}

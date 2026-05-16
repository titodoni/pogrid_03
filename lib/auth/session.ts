import { cookies } from "next/headers";
import { prisma } from "@/lib/db/prisma";

export type SessionPayload = {
  userId: string;
  role: string;
  roleKey: string;
  departmentId?: string;
  workspaceId: string;
  sessionVersion: number;
  issuedAt: string;
};

export async function getSessionCookie(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get("session_token")?.value;
}

export async function validateSession(): Promise<SessionPayload | null> {
  const token = await getSessionCookie();
  if (!token) return null;

  const session = await prisma.session.findFirst({
    where: { sessionTokenHash: token },
    include: {
      user: {
        include: {
          department: true,
        },
      },
      workspace: true,
    },
  });

  if (!session || !session.user.isActive) return null;

  if (!session.user.workspaceId) return null;

  return {
    userId: session.user.id,
    role: session.user.role,
    roleKey: session.user.roleKey,
    departmentId: session.user.departmentId ?? undefined,
    workspaceId: session.workspaceId,
    sessionVersion: 1,
    issuedAt: session.createdAt.toISOString(),
  };
}

export async function requireSession(): Promise<SessionPayload> {
  const session = await validateSession();
  if (!session) {
    throw new Error("Sesi tidak ditemukan. Silakan login ulang.");
  }
  return session;
}

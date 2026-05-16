import { cookies } from "next/headers";
import { randomBytes } from "node:crypto";
import { prisma } from "@/lib/db/prisma";
import { AuthError } from "@/lib/workflow/errors";

export type SessionPayload = {
  userId: string;
  role: string;
  roleKey: string;
  departmentId?: string;
  workspaceId: string;
  sessionVersion: number;
  issuedAt: string;
  name: string;
};

export function generateSessionToken(): string {
  return randomBytes(32).toString("hex");
}

export async function getSessionCookie(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get("session_token")?.value;
}

export async function setSessionCookie(token: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set("session_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });
}

export async function clearSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set("session_token", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}

export async function createSession(
  userId: string,
  workspaceId: string,
): Promise<string> {
  const token = generateSessionToken();

  await prisma.session.create({
    data: {
      userId,
      workspaceId,
      sessionTokenHash: token,
    },
  });

  await prisma.user.update({
    where: { id: userId },
    data: { lastLoginAt: new Date() },
  });

  return token;
}

export async function destroySession(token: string): Promise<void> {
  await prisma.session.deleteMany({
    where: { sessionTokenHash: token },
  });
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
    name: session.user.name,
  };
}

export async function requireSession(): Promise<SessionPayload> {
  const session = await validateSession();
  if (!session) {
    throw new AuthError("Sesi tidak ditemukan. Silakan login ulang.");
  }
  return session;
}

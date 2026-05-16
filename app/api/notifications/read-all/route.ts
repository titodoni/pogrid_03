import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { validateSession } from "@/lib/auth/session";

export async function POST() {
  const session = await validateSession();
  if (!session) return NextResponse.json({ ok: false }, { status: 401 });

  await prisma.notification.updateMany({
    where: {
      workspaceId: session.workspaceId,
      readAt: null,
      OR: [
        { targetUserId: session.userId },
        { targetRoleKey: session.roleKey },
      ],
    },
    data: { readAt: new Date() },
  });

  return NextResponse.json({ ok: true });
}

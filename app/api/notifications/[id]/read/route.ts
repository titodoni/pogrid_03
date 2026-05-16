import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { validateSession } from "@/lib/auth/session";

export async function PATCH(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await validateSession();
  if (!session) return NextResponse.json({ ok: false }, { status: 401 });

  const { id } = await params;

  await prisma.notification.updateMany({
    where: {
      id,
      workspaceId: session.workspaceId,
      OR: [
        { targetUserId: session.userId },
        { targetRoleKey: session.roleKey },
      ],
    },
    data: { readAt: new Date() },
  });

  return NextResponse.json({ ok: true });
}

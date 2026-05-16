import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { validateSession } from "@/lib/auth/session";

export async function GET() {
  const session = await validateSession();
  if (!session) return NextResponse.json({ ok: false }, { status: 401 });

  const notifications = await prisma.notification.findMany({
    where: {
      workspaceId: session.workspaceId,
      OR: [
        { targetUserId: session.userId },
        { targetRoleKey: session.roleKey },
      ],
    },
    orderBy: { createdAt: "desc" },
    take: 30,
    select: {
      id: true,
      type: true,
      title: true,
      body: true,
      readAt: true,
      createdAt: true,
      poId: true,
      itemId: true,
    },
  });

  const unreadCount = notifications.filter((n) => !n.readAt).length;

  return NextResponse.json({ ok: true, data: notifications, unreadCount });
}

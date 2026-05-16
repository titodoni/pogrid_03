import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { validateSession } from "@/lib/auth/session";

export async function GET() {
  const session = await validateSession();
  if (!session) return NextResponse.json({ ok: false }, { status: 401 });

  const clients = await prisma.client.findMany({
    where: { workspaceId: session.workspaceId, isActive: true },
    orderBy: { name: "asc" },
    select: { id: true, name: true, contact: true },
  });

  return NextResponse.json({ ok: true, data: clients });
}

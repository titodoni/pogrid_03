import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { validateSession } from "@/lib/auth/session";

export async function GET() {
  const session = await validateSession();
  if (!session) return NextResponse.json({ ok: false }, { status: 401 });

  const departments = await prisma.department.findMany({
    where: { workspaceId: session.workspaceId, isActive: true },
    orderBy: { stageOrder: "asc" },
    select: { id: true, name: true, roleKey: true, stageOrder: true },
  });

  return NextResponse.json({ ok: true, data: departments });
}

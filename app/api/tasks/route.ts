import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { validateSession } from "@/lib/auth/session";

export async function GET() {
  const session = await validateSession();
  if (!session) return NextResponse.json({ ok: false }, { status: 401 });
  if (!session.departmentId) return NextResponse.json({ ok: true, data: [] });

  const items = await prisma.item.findMany({
    where: {
      workspaceId: session.workspaceId,
      requiredDepartments: { some: { id: session.departmentId } },
      status: { notIn: ["DONE"] },
      productionOrder: { deletedAt: null },
    },
    include: {
      productionOrder: {
        select: { id: true, internalPoNumber: true, dueDate: true, client: { select: { name: true } } },
      },
      progress: {
        where: { departmentId: session.departmentId },
        select: { progressValue: true, completedAt: true, startedAt: true },
      },
      problems: {
        where: { isResolved: false },
        select: { id: true, category: true, note: true },
      },
      requiredDepartments: { select: { id: true, name: true }, orderBy: { stageOrder: "asc" } },
    },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json({ ok: true, data: items });
}

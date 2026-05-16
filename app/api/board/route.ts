import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { validateSession } from "@/lib/auth/session";

export async function GET() {
  const session = await validateSession();
  if (!session) return NextResponse.json({ ok: false }, { status: 401 });

  const now = new Date();

  const [orders, problems, departments] = await Promise.all([
    prisma.productionOrder.findMany({
      where: { workspaceId: session.workspaceId, deletedAt: null },
      include: {
        client: { select: { name: true } },
        items: {
          select: {
            id: true, status: true,
            progress: { include: { department: { select: { id: true, name: true } } } },
            problems: { where: { isResolved: false }, select: { id: true } },
          },
        },
      },
    }),
    prisma.problem.findMany({
      where: { workspaceId: session.workspaceId, isResolved: false },
      include: {
        item: {
          select: {
            name: true,
            productionOrder: { select: { internalPoNumber: true, client: { select: { name: true } } } },
          },
        },
        reportedBy: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 30,
    }),
    prisma.department.findMany({
      where: { workspaceId: session.workspaceId, isActive: true },
      orderBy: { stageOrder: "asc" },
      select: { id: true, name: true, stageOrder: true },
    }),
  ]);

  const overdue = orders.filter((o) => o.dueDate && o.dueDate < now);
  const active = orders.filter(
    (o) => !o.items.every((i) => i.status === "DONE")
  );

  // Stage bottleneck: count items per department that have progress < 100
  const bottleneck: Record<string, { name: string; count: number }> = {};
  for (const o of orders) {
    for (const item of o.items) {
      for (const prog of item.progress) {
        if (prog.progressValue < 100 && prog.department) {
          const key = prog.department.id;
          if (!bottleneck[key]) bottleneck[key] = { name: prog.department.name, count: 0 };
          bottleneck[key].count++;
        }
      }
    }
  }

  return NextResponse.json({
    ok: true,
    data: { orders, overdue, active, problems, departments, bottleneck },
  });
}

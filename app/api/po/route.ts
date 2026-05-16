import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { validateSession } from "@/lib/auth/session";

export async function GET() {
  const session = await validateSession();
  if (!session) return NextResponse.json({ ok: false }, { status: 401 });

  const orders = await prisma.productionOrder.findMany({
    where: { workspaceId: session.workspaceId, deletedAt: null },
    orderBy: { dueDate: "asc" },
    include: {
      client: { select: { id: true, name: true } },
      items: {
        where: { parentItemId: null },
        include: {
          progress: { include: { department: { select: { id: true, name: true } } } },
          problems: { where: { isResolved: false }, select: { id: true, category: true } },
          requiredDepartments: { select: { id: true, name: true } },
        },
      },
    },
  });

  return NextResponse.json({ ok: true, data: orders });
}

export async function POST(req: NextRequest) {
  const session = await validateSession();
  if (!session) return NextResponse.json({ ok: false }, { status: 401 });

  const body = await req.json();
  const { internalPoNumber, clientId, clientPoNumber, dueDate, notes, items } = body;

  if (!internalPoNumber || !clientId || !items?.length) {
    return NextResponse.json({ ok: false, error: "Data tidak lengkap." }, { status: 400 });
  }

  const departments = await prisma.department.findMany({
    where: { workspaceId: session.workspaceId, isActive: true },
    select: { id: true, roleKey: true },
  });
  const deptMap = Object.fromEntries(departments.map((d) => [d.roleKey, d.id]));

  const po = await prisma.productionOrder.create({
    data: {
      workspaceId: session.workspaceId,
      clientId,
      internalPoNumber,
      clientPoNumber: clientPoNumber || null,
      poDate: new Date(),
      dueDate: dueDate ? new Date(dueDate) : null,
      notes: notes || null,
      createdByUserId: session.userId,
    },
  });

  for (const item of items) {
    const deptIds: string[] = (item.departments || [])
      .map((rk: string) => deptMap[rk])
      .filter(Boolean);

    const created = await prisma.item.create({
      data: {
        workspaceId: session.workspaceId,
        productionOrderId: po.id,
        name: item.name,
        quantity: Math.max(1, Number(item.quantity) || 1),
        unit: item.unit || "pcs",
        specification: item.specification || null,
        requiredDepartments: deptIds.length
          ? { connect: deptIds.map((id) => ({ id })) }
          : undefined,
      },
    });

    if (deptIds.length) {
      await prisma.itemProgress.createMany({
        data: deptIds.map((departmentId) => ({
          workspaceId: session.workspaceId,
          itemId: created.id,
          departmentId,
          progressValue: 0,
        })),
        skipDuplicates: true,
      });
    }
  }

  return NextResponse.json({ ok: true, data: { id: po.id } });
}

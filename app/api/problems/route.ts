import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { validateSession } from "@/lib/auth/session";

export async function GET() {
  const session = await validateSession();
  if (!session) return NextResponse.json({ ok: false }, { status: 401 });

  const problems = await prisma.problem.findMany({
    where: { workspaceId: session.workspaceId, isResolved: false },
    include: {
      item: {
        include: {
          productionOrder: { include: { client: { select: { name: true } } } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ ok: true, data: problems });
}

export async function POST(req: NextRequest) {
  const session = await validateSession();
  if (!session) return NextResponse.json({ ok: false }, { status: 401 });

  const { itemId, category, note } = await req.json();
  if (!itemId || !category) {
    return NextResponse.json({ ok: false, error: "itemId dan category wajib diisi." }, { status: 400 });
  }

  const item = await prisma.item.findFirst({
    where: { id: itemId, workspaceId: session.workspaceId },
  });
  if (!item) return NextResponse.json({ ok: false, error: "Item tidak ditemukan." }, { status: 404 });

  const problem = await prisma.problem.create({
    data: {
      workspaceId: session.workspaceId,
      itemId,
      category,
      note: note || null,
      reportedByUserId: session.userId,
      reporterType: "USER",
      isResolved: false,
    },
  });

  // Write notification for ADMIN and MANAGER roles
  await prisma.notification.createMany({
    data: [
      {
        workspaceId: session.workspaceId,
        targetRoleKey: "ADMIN",
        type: "PROBLEM_REPORTED",
        title: "Masalah dilaporkan",
        body: `${item.name}: ${category}`,
        itemId: item.id,
        problemId: problem.id,
        poId: item.productionOrderId,
      },
      {
        workspaceId: session.workspaceId,
        targetRoleKey: "MANAGER",
        type: "PROBLEM_REPORTED",
        title: "Masalah dilaporkan",
        body: `${item.name}: ${category}`,
        itemId: item.id,
        problemId: problem.id,
        poId: item.productionOrderId,
      },
    ],
    skipDuplicates: true,
  });

  return NextResponse.json({ ok: true, data: { id: problem.id } });
}

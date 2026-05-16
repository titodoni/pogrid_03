import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { validateSession } from "@/lib/auth/session";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await validateSession();
  if (!session) return NextResponse.json({ ok: false }, { status: 401 });

  const { id } = await params;

  const po = await prisma.productionOrder.findFirst({
    where: { id, workspaceId: session.workspaceId, deletedAt: null },
    include: {
      client: true,
      createdBy: { select: { name: true } },
      items: {
        where: { parentItemId: null },
        include: {
          progress: {
            include: {
              department: { select: { id: true, name: true, stageOrder: true } },
              lastUpdatedBy: { select: { name: true } },
            },
          },
          problems: {
            include: { reportedBy: { select: { name: true } } },
          },
          requiredDepartments: {
            select: { id: true, name: true, stageOrder: true },
            orderBy: { stageOrder: "asc" },
          },
          childItems: {
            include: {
              progress: { include: { department: { select: { id: true, name: true } } } },
              problems: { where: { isResolved: false }, select: { id: true, category: true, note: true } },
              requiredDepartments: { select: { id: true, name: true } },
            },
          },
        },
      },
    },
  });

  if (!po) return NextResponse.json({ ok: false, error: "PO tidak ditemukan." }, { status: 404 });

  return NextResponse.json({ ok: true, data: po });
}

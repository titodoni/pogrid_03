import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { validateSession } from "@/lib/auth/session";

export async function GET() {
  const session = await validateSession();
  if (!session) return NextResponse.json({ ok: false }, { status: 401 });

  // Finance queue = all DONE items in this workspace, ordered by doneAt desc
  const items = await prisma.item.findMany({
    where: {
      workspaceId: session.workspaceId,
      status: "DONE",
      parentItemId: null,
      productionOrder: { deletedAt: null },
    },
    select: {
      id: true,
      name: true,
      quantity: true,
      unit: true,
      invoiceStatus: true,
      doneAt: true,
      productionOrder: {
        select: {
          internalPoNumber: true,
          client: { select: { name: true } },
        },
      },
    },
    orderBy: { doneAt: "desc" },
  });

  return NextResponse.json({ ok: true, data: items });
}

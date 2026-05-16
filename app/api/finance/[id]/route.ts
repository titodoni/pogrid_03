import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { validateSession } from "@/lib/auth/session";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await validateSession();
  if (!session) return NextResponse.json({ ok: false }, { status: 401 });
  if (session.role !== "FINANCE" && session.role !== "ADMIN") {
    return NextResponse.json({ ok: false, error: "Akses ditolak." }, { status: 403 });
  }

  const { id } = await params;
  const { status } = await req.json();

  const allowed = ["PENDING", "INVOICED", "PAID"];
  if (!allowed.includes(status)) {
    return NextResponse.json({ ok: false, error: "Status tidak valid." }, { status: 400 });
  }

  const item = await prisma.item.findFirst({
    where: { id, workspaceId: session.workspaceId, status: "DONE" },
  });
  if (!item) return NextResponse.json({ ok: false, error: "Item tidak ditemukan." }, { status: 404 });

  await prisma.item.update({
    where: { id },
    data: { invoiceStatus: status },
  });

  return NextResponse.json({ ok: true });
}

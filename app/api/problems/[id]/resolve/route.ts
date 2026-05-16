import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { validateSession } from "@/lib/auth/session";

export async function PATCH(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await validateSession();
  if (!session) return NextResponse.json({ ok: false }, { status: 401 });

  const { id } = await params;

  const problem = await prisma.problem.findFirst({
    where: { id, workspaceId: session.workspaceId },
  });
  if (!problem) return NextResponse.json({ ok: false, error: "Tidak ditemukan." }, { status: 404 });

  await prisma.problem.update({
    where: { id },
    data: {
      isResolved: true,
      resolvedAt: new Date(),
      resolvedByUserId: session.userId,
    },
  });

  return NextResponse.json({ ok: true });
}

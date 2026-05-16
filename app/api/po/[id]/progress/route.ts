import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { validateSession } from "@/lib/auth/session";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await validateSession();
  if (!session || !session.departmentId)
    return NextResponse.json({ ok: false, error: "Akses ditolak." }, { status: 403 });

  const { id: poId } = await params;
  const body = await req.json();
  const { itemId, progressValue } = body;

  if (typeof progressValue !== "number" || progressValue < 0 || progressValue > 100)
    return NextResponse.json({ ok: false, error: "Nilai progress tidak valid." }, { status: 400 });

  const existing = await prisma.itemProgress.findUnique({
    where: { itemId_departmentId: { itemId, departmentId: session.departmentId } },
  });

  if (existing && progressValue < existing.progressValue)
    return NextResponse.json({ ok: false, error: "Progress tidak bisa mundur." }, { status: 400 });

  const progress = await prisma.itemProgress.upsert({
    where: { itemId_departmentId: { itemId, departmentId: session.departmentId } },
    create: {
      workspaceId: session.workspaceId,
      itemId,
      departmentId: session.departmentId,
      progressValue,
      lastUpdatedByUserId: session.userId,
      lastUpdatedAt: new Date(),
      startedAt: new Date(),
      completedAt: progressValue === 100 ? new Date() : null,
    },
    update: {
      progressValue,
      lastUpdatedByUserId: session.userId,
      lastUpdatedAt: new Date(),
      completedAt: progressValue === 100 ? new Date() : null,
    },
  });

  return NextResponse.json({ ok: true, data: progress });
}

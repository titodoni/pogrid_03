import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/auth/session";
import { requireAdmin } from "@/lib/auth/guards";
import { hashPin, generateStaffPin } from "@/lib/auth/pin";
import { prisma } from "@/lib/db/prisma";
import { createAuditLog } from "@/lib/audit/audit-log";

export async function POST(request: NextRequest) {
  try {
    const session = await requireSession();
    const guard = requireAdmin(session);
    if (!guard.allowed) {
      return NextResponse.json(
        { ok: false, error: guard.reason },
        { status: 403 },
      );
    }

    const body = await request.json();
    const { targetUserId } = body;

    if (!targetUserId) {
      return NextResponse.json(
        { ok: false, error: "Target user ID diperlukan." },
        { status: 400 },
      );
    }

    const targetUser = await prisma.user.findFirst({
      where: { id: targetUserId, workspaceId: session.workspaceId },
    });

    if (!targetUser) {
      return NextResponse.json(
        { ok: false, error: "User tidak ditemukan." },
        { status: 404 },
      );
    }

    const newPin = generateStaffPin();
    const pinHash = hashPin(newPin);

    await prisma.user.update({
      where: { id: targetUserId },
      data: { pinHash },
    });

    await createAuditLog({
      workspaceId: session.workspaceId,
      actorUserId: session.userId,
      actorType: "USER",
      action: "PIN_RESET",
      entityType: "User",
      entityId: targetUserId,
      metadata: { targetRoleKey: targetUser.roleKey },
    });

    return NextResponse.json({
      ok: true,
      data: { newPin, userName: targetUser.name },
    });
  } catch (error: unknown) {
    const err = error as { code?: string; name?: string; message?: string };
    if (err?.code === "AUTH_ERROR" || err?.name === "AuthError") {
      return NextResponse.json(
        { ok: false, error: err?.message || "Sesi tidak valid." },
        { status: 401 },
      );
    }
    console.error("Reset PIN error:", err);
    return NextResponse.json(
      { ok: false, error: "Terjadi kesalahan server." },
      { status: 500 },
    );
  }
}

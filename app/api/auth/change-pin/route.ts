import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/auth/session";
import { hashPin } from "@/lib/auth/pin";
import { prisma } from "@/lib/db/prisma";
import { createAuditLog } from "@/lib/audit/audit-log";

export async function POST(request: NextRequest) {
  try {
    const session = await requireSession();

    const body = await request.json();
    const { newPin } = body;

    if (!newPin || typeof newPin !== "string") {
      return NextResponse.json(
        { ok: false, error: "PIN baru diperlukan." },
        { status: 400 },
      );
    }

    const isStaff = session.role !== "SUPERADMIN";

    if (isStaff && !/^\d{4}$/.test(newPin)) {
      return NextResponse.json(
        { ok: false, error: "PIN staf harus 4 digit angka." },
        { status: 400 },
      );
    }

    if (!isStaff && !/^\d{6}$/.test(newPin)) {
      return NextResponse.json(
        { ok: false, error: "PIN superadmin harus 6 digit angka." },
        { status: 400 },
      );
    }

    const pinHash = hashPin(newPin);

    await prisma.user.update({
      where: { id: session.userId },
      data: { pinHash },
    });

    await createAuditLog({
      workspaceId: session.workspaceId,
      actorUserId: session.userId,
      actorType: "USER",
      action: "SELF_PIN_CHANGE",
      entityType: "User",
      entityId: session.userId,
    });

    return NextResponse.json({ ok: true });
  } catch (error: unknown) {
    const err = error as { code?: string; name?: string; message?: string };
    if (err?.code === "AUTH_ERROR" || err?.name === "AuthError") {
      return NextResponse.json(
        { ok: false, error: err?.message || "Sesi tidak valid." },
        { status: 401 },
      );
    }
    console.error("Change PIN error:", err);
    return NextResponse.json(
      { ok: false, error: "Terjadi kesalahan server." },
      { status: 500 },
    );
  }
}

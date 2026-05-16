import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { verifyPin } from "@/lib/auth/pin";
import { createSession, setSessionCookie } from "@/lib/auth/session";
import { ROLE_HOME_ROUTES } from "@/lib/constants";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, pin } = body;

    if (!userId || !pin) {
      return NextResponse.json(
        { ok: false, error: "User ID dan PIN diperlukan." },
        { status: 400 },
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { workspace: true },
    });

    if (!user || !user.isActive || !user.workspaceId) {
      return NextResponse.json(
        { ok: false, error: "User tidak ditemukan atau tidak aktif." },
        { status: 401 },
      );
    }

    const valid = verifyPin(pin, user.pinHash);
    if (!valid) {
      return NextResponse.json(
        { ok: false, error: "PIN salah." },
        { status: 401 },
      );
    }

    const token = await createSession(user.id, user.workspaceId);
    await setSessionCookie(token);

    const homeRoute = ROLE_HOME_ROUTES[user.roleKey] || ROLE_HOME_ROUTES[user.role] || "/tasks";

    return NextResponse.json({
      ok: true,
      data: {
        user: {
          id: user.id,
          name: user.name,
          role: user.role,
          roleKey: user.roleKey,
          departmentId: user.departmentId,
          workspaceId: user.workspaceId,
        },
        redirect: homeRoute,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { ok: false, error: "Terjadi kesalahan server." },
      { status: 500 },
    );
  }
}

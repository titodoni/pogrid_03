import { NextResponse } from "next/server";
import { validateSession } from "@/lib/auth/session";

export async function GET() {
  try {
    const session = await validateSession();

    if (!session) {
      return NextResponse.json({ ok: false, data: null });
    }

    return NextResponse.json({
      ok: true,
      data: {
        userId: session.userId,
        name: session.name,
        role: session.role,
        roleKey: session.roleKey,
        departmentId: session.departmentId,
        workspaceId: session.workspaceId,
      },
    });
  } catch (error) {
    console.error("Session check error:", error);
    return NextResponse.json(
      { ok: false, error: "Gagal memeriksa sesi." },
      { status: 500 },
    );
  }
}

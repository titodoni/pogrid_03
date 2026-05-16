import { NextResponse } from "next/server";
import { destroySession, getSessionCookie, clearSessionCookie } from "@/lib/auth/session";

export async function POST() {
  try {
    const token = await getSessionCookie();
    if (token) {
      await destroySession(token);
    }
    await clearSessionCookie();

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.json(
      { ok: false, error: "Gagal logout." },
      { status: 500 },
    );
  }
}

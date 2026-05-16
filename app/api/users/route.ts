import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import type { Prisma } from "@/app/generated/prisma/client";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const roleKey = searchParams.get("roleKey");
    const departmentId = searchParams.get("departmentId");

    const where: Prisma.UserWhereInput = {
      isActive: true,
      workspaceId: { not: null },
      role: { not: "SUPERADMIN" },
    };

    if (roleKey) {
      where.roleKey = roleKey;
    }

    if (departmentId) {
      where.departmentId = departmentId;
    }

    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        role: true,
        roleKey: true,
        departmentId: true,
        department: { select: { id: true, name: true } },
      },
      orderBy: { name: "asc" },
    });

    return NextResponse.json({ ok: true, data: users });
  } catch (error) {
    console.error("Users fetch error:", error);
    return NextResponse.json(
      { ok: false, error: "Gagal memuat data user." },
      { status: 500 },
    );
  }
}

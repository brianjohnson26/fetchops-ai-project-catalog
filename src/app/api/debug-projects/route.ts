// src/app/api/debug-projects/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const count = await prisma.project.count();
    const sample = await prisma.project.findMany({
      select: { id: true, title: true, team: true, createdAt: true },
      orderBy: { createdAt: "desc" },
      take: 3,
    });
    return NextResponse.json({ ok: true, count, sample });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // Debug: log what environment variables we're seeing
    console.log("DATABASE_URL_SUPABASE:", process.env.DATABASE_URL_SUPABASE ? "SET" : "NOT SET");
    console.log("DATABASE_URL:", process.env.DATABASE_URL ? "SET" : "NOT SET");

    const count = await prisma.project.count();
    return NextResponse.json({ ok: true, db: "up", projects: count });
  } catch (error) {
    console.error("Database connection failed:", error);
    return NextResponse.json(
      { ok: false, db: "down", error: String(error) },
      { status: 500 }
    );
  }
}
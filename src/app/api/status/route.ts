import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // Debug: log what environment variables we're seeing
    console.log("DATABASE_URL_SUPABASE:", process.env.DATABASE_URL_SUPABASE ? "SET" : "NOT SET");
    console.log("DATABASE_URL:", process.env.DATABASE_URL ? "SET" : "NOT SET");

    // Skip database operations during build time
    if (process.env.NODE_ENV === "development" && !process.env.DATABASE_URL_SUPABASE) {
      return NextResponse.json({ ok: true, db: "build", projects: 0 });
    }

    const count = await prisma.project.count();
    return NextResponse.json({ ok: true, db: "up", projects: count });
  } catch (error) {
    console.error("Database connection failed:", error);
    console.error("Connection details:", {
      host: process.env.DATABASE_URL_SUPABASE?.match(/@([^:]+)/)?.[1],
      port: process.env.DATABASE_URL_SUPABASE?.match(/:(\d+)/)?.[1]
    });
    return NextResponse.json(
      { ok: false, db: "down", error: String(error), code: error.code || 'UNKNOWN' },
      { status: 500 }
    );
  }
}
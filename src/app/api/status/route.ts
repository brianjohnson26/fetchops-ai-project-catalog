import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // Debug: log what environment variables we're seeing
    const dbUrl = process.env.DATABASE_URL_SUPABASE;
    console.log("DATABASE_URL_SUPABASE:", dbUrl ? "SET" : "NOT SET");
    
    if (dbUrl) {
      const urlInfo = {
        host: dbUrl.match(/@([^:]+)/)?.[1],
        port: dbUrl.match(/:(\d+)\/postgres/)?.[1],
        hasSSL: dbUrl.includes('sslmode=require'),
        isPooler: dbUrl.includes('pooler.supabase.com')
      };
      console.log("Connection URL analysis:", urlInfo);
    }

    // Skip database operations during build time
    if (process.env.NODE_ENV === "development" && !dbUrl) {
      return NextResponse.json({ ok: true, db: "build", projects: 0 });
    }

    if (!dbUrl) {
      return NextResponse.json(
        { ok: false, db: "down", error: "DATABASE_URL_SUPABASE not configured" },
        { status: 500 }
      );
    }

    // Test connection with a timeout
    const startTime = Date.now();
    const count = await Promise.race([
      prisma.project.count(),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Database query timeout')), 5000)
      )
    ]) as number;
    
    const queryTime = Date.now() - startTime;
    
    return NextResponse.json({ 
      ok: true, 
      db: "up", 
      projects: count, 
      queryTime: `${queryTime}ms`,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error("Database connection failed:", error);
    const errorCode = error && typeof error === 'object' && 'code' in error ? error.code : 'UNKNOWN';
    return NextResponse.json(
      { ok: false, db: "down", error: String(error), code: errorCode },
      { status: 500 }
    );
  }
}
// src/app/api/home-stats/route.ts
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    console.log("home-stats: Starting fresh query...");
    
    // Force fresh connection and bypass any query caching
    await prisma.$disconnect();
    await new Promise(resolve => setTimeout(resolve, 200)); // Longer delay
    await prisma.$connect();
    
    // Execute multiple queries to ensure connection is truly fresh
    await prisma.$executeRaw`SELECT 1`;
    await prisma.$executeRaw`SELECT COUNT(*) FROM "Project"`;
    
    // Get the latest data with a fresh query
    const projects = await prisma.project.findMany({
      select: {
        id: true,
        title: true,
        team: true,
        owner: true,
        createdAt: true,
        updatedAt: true,
        hoursSavedPerWeek: true,
        tools: { select: { tool: { select: { name: true } } } },
      },
      orderBy: { createdAt: "desc" },
    });

    console.log(`home-stats: Found ${projects.length} projects`);
    console.log("home-stats: Latest 3 projects:", projects.slice(0, 3).map(p => ({ id: p.id, title: p.title })));

    const projectCount = projects.length;
    const totalHours =
      projects.reduce((sum, p) => sum + (p.hoursSavedPerWeek ?? 0), 0) || 0;
    const distinctOwners = new Set(projects.map(p => p.owner).filter(Boolean)).size;

    const toolCounts = new Map<string, number>();
    for (const p of projects) {
      for (const t of p.tools) {
        const name = t.tool?.name ?? "(Unknown)";
        toolCounts.set(name, (toolCounts.get(name) ?? 0) + 1);
      }
    }
    const mostCommonTools = [...toolCounts.entries()]
      .map(([name, count]) => ({ name, count }))
      .filter((t) => t.count > 0)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    const latest = projects.slice(0, 5).map(p => ({
      id: p.id, title: p.title, team: p.team, createdAt: p.createdAt,
    }));

    console.log("home-stats: Returning latest projects:", latest.map(p => ({ id: p.id, title: p.title })));

    const response = NextResponse.json({
      ok: true,
      projectCount,
      totalHours,
      distinctOwners,
      mostCommonTools,
      latest,
      timestamp: Date.now(), // Add timestamp to ensure fresh data
    });
    
    // Add strongest possible cache-busting headers
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0, s-maxage=0');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    response.headers.set('Surrogate-Control', 'no-store');
    response.headers.set('Vary', '*');
    response.headers.set('ETag', `"${Date.now()}"`);
    
    return response;
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}

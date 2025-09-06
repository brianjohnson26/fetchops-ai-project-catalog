// src/app/api/home-stats/route.ts
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // Single DB query; compute stats in memory
    const projects = await prisma.project.findMany({
      select: {
        id: true,
        title: true,
        team: true,
        createdAt: true,
        hoursSavedPerWeek: true,
        tools: { select: { tool: { select: { name: true } } } },
      },
      orderBy: { createdAt: "desc" },
    });

    const projectCount = projects.length;
    const totalHours =
      projects.reduce((sum, p) => sum + (p.hoursSavedPerWeek ?? 0), 0) || 0;

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

    return NextResponse.json({
      ok: true,
      projectCount,
      totalHours,
      mostCommonTools,
      latest,
    });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}

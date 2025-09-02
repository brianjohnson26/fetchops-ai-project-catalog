import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Simple JSON export with optional ?q= search.
// Returns projects with tools and links.
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") || "").trim();

  const OR = q
    ? [
        { title: { contains: q } },
        { description: { contains: q } },
        { team: { contains: q } },
        { owner: { contains: q } },
        // NEW fields included in search:
        { howYouBuiltIt: { contains: q } },
        { challengesSolutionsTips: { contains: q } },
        { otherImpacts: { contains: q } },
        // tool names
        { tools: { some: { tool: { name: { contains: q } } } } },
      ]
    : undefined;

  const projects = await prisma.project.findMany({
    where: { OR },
    orderBy: { createdAt: "desc" },
    include: {
      tools: { include: { tool: true } },
      links: true,
    },
  });

  // shape a compact payload
  const payload = projects.map((p) => ({
    id: p.id,
    title: p.title,
    description: p.description,
    team: p.team,
    owner: p.owner,
    hoursSavedPerWeek: p.hoursSavedPerWeek,
    howYouBuiltIt: p.howYouBuiltIt ?? null,
    challengesSolutionsTips: p.challengesSolutionsTips ?? null,
    otherImpacts: p.otherImpacts ?? null,
    tools: p.tools.map((t) => t.tool.name),
    links: p.links.map((l) => ({ type: l.type, url: l.url })),
    createdAt: p.createdAt,
    updatedAt: p.updatedAt,
  }));

  return NextResponse.json({ ok: true, count: payload.length, projects: payload });
}

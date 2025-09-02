import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function csvEscape(v: any) {
  const s = v === null || v === undefined ? "" : String(v);
  // escape quotes and wrap in quotes if needed
  const needsQuotes = /[",\n]/.test(s);
  const escaped = s.replace(/"/g, '""');
  return needsQuotes ? `"${escaped}"` : escaped;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") || "").trim();

  const OR = q
    ? [
        { title: { contains: q } },
        { description: { contains: q } },
        { team: { contains: q } },
        { owner: { contains: q } },
        { howYouBuiltIt: { contains: q } },
        { challengesSolutionsTips: { contains: q } },
        { otherImpacts: { contains: q } },
        { tools: { some: { tool: { name: { contains: q } } } } },
      ]
    : undefined;

  const rows = await prisma.project.findMany({
    where: { OR },
    orderBy: { createdAt: "desc" },
    include: {
      tools: { include: { tool: true } },
      links: true,
    },
  });

  const header = [
    "id",
    "title",
    "description",
    "team",
    "owner",
    "hoursSavedPerWeek",
    "howYouBuiltIt",
    "challengesSolutionsTips",
    "otherImpacts",
    "tools",
    "links",
    "createdAt",
    "updatedAt",
  ].join(",");

  const lines = rows.map((r) => {
    const tools = r.tools.map((t) => t.tool.name).join("; ");
    const links = r.links.map((l) => `${l.type}:${l.url}`).join("; ");
    return [
      csvEscape(r.id),
      csvEscape(r.title),
      csvEscape(r.description),
      csvEscape(r.team),
      csvEscape(r.owner),
      csvEscape(r.hoursSavedPerWeek),
      csvEscape(r.howYouBuiltIt ?? ""),
      csvEscape(r.challengesSolutionsTips ?? ""),
      csvEscape(r.otherImpacts ?? ""),
      csvEscape(tools),
      csvEscape(links),
      csvEscape(r.createdAt.toISOString()),
      csvEscape(r.updatedAt.toISOString()),
    ].join(",");
  });

  const csv = [header, ...lines].join("\n");

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="projects.csv"`,
      "Cache-Control": "no-store",
    },
  });
}

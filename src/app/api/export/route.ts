// src/app/api/projects-csv/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Utility: CSV escaping for a single cell
function csvCell(v: unknown): string {
  if (v === null || v === undefined) return "";
  const s = String(v);
  // Escape quotes by doubling them, wrap in quotes if it contains comma, quote, or newline
  const needsQuotes = /[",\n]/.test(s);
  const escaped = s.replace(/"/g, '""');
  return needsQuotes ? `"${escaped}"` : escaped;
}

// Build a CSV row from an array of values
function csvRow(values: Array<unknown>): string {
  return values.map(csvCell).join(",") + "\n";
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  // Free-text search
  const q = (searchParams.get("q") || "").trim();

  // Optional filters
  const team = (searchParams.get("team") || "").trim();
  const owner = (searchParams.get("owner") || "").trim();
  const tool = (searchParams.get("tool") || "").trim();

  // Optional date range by deploymentDate (YYYY-MM-DD)
  const dateFrom = (searchParams.get("dateFrom") || "").trim();
  const dateTo = (searchParams.get("dateTo") || "").trim();

  const OR = q
    ? [
        { title: { contains: q, mode: "insensitive" as const } },
        { description: { contains: q, mode: "insensitive" as const } },
        { team: { contains: q, mode: "insensitive" as const } },
        { owner: { contains: q, mode: "insensitive" as const } },
        { howYouBuiltIt: { contains: q, mode: "insensitive" as const } },
        { challengesSolutionsTips: { contains: q, mode: "insensitive" as const } },
        { otherImpacts: { contains: q, mode: "insensitive" as const } },
        // tool names
        { tools: { some: { tool: { name: { contains: q, mode: "insensitive" as const } } } } },
      ]
    : undefined;

  // AND filters
  const AND: any[] = [];

  if (team) AND.push({ team: { equals: team } });
  if (owner) AND.push({ owner: { equals: owner } });
  if (tool) AND.push({ tools: { some: { tool: { name: { equals: tool } } } } });

  // Deployment date filters
  if (dateFrom) {
    const from = new Date(dateFrom);
    if (!isNaN(from.getTime())) {
      AND.push({ deploymentDate: { gte: from } });
    }
  }
  if (dateTo) {
    // Set to end-of-day to make the filter inclusive
    const to = new Date(dateTo);
    if (!isNaN(to.getTime())) {
      to.setHours(23, 59, 59, 999);
      AND.push({ deploymentDate: { lte: to } });
    }
  }

  const where =
    OR || AND.length
      ? {
          AND: AND.length ? AND : undefined,
          OR,
        }
      : undefined;

  const projects = await prisma.project.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      tools: { include: { tool: true } },
      links: true,
    },
  });

  // CSV header
  const headers = [
    "id",
    "title",
    "description",
    "team",
    "owner",
    "hoursSavedPerWeek",
    "howYouBuiltIt",
    "challengesSolutionsTips",
    "otherImpacts",
    "deploymentDate",
    "tools", // semicolon-separated
    "links", // semicolon-separated "type:url"
    "createdAt",
    "updatedAt",
  ];

  let csv = "";
  csv += csvRow(headers);

  for (const p of projects) {
    const toolList = p.tools.map((t) => t.tool.name).join("; ");
    const linkList = p.links.map((l) => `${l.type}:${l.url}`).join("; ");
    const deploymentDate = p.deploymentDate ? p.deploymentDate.toISOString() : "";

    csv += csvRow([
      p.id,
      p.title,
      p.description,
      p.team,
      p.owner,
      p.hoursSavedPerWeek ?? 0,
      p.howYouBuiltIt ?? "",
      p.challengesSolutionsTips ?? "",
      p.otherImpacts ?? "",
      deploymentDate,
      toolList,
      linkList,
      p.createdAt?.toISOString?.() ?? "",
      p.updatedAt?.toISOString?.() ?? "",
    ]);
  }

  // Return CSV with download headers
  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="projects_export.csv"`,
      // Disable caching to ensure fresh data
      "Cache-Control": "no-store, max-age=0",
    },
  });
}

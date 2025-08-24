import { prisma } from "@/lib/prisma";

function esc(v: unknown) {
  const s = String(v ?? "");
  return `"${s.replace(/"/g, '""')}"`;
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const team = searchParams.get("team") ?? "";
  const owner = searchParams.get("owner") ?? "";
  const tool  = searchParams.get("tool") ?? "";
  const q     = searchParams.get("q") ?? "";

  // Build Prisma where the same way as Browse (SQLite-safe)
  const AND: any[] = [];
  if (team) AND.push({ team });
  if (owner) AND.push({ slackHandle: owner });
  if (tool) AND.push({ tools: { some: { tool: { name: tool } } } });
  if (q) {
    AND.push({
      OR: [
        { title: { contains: q } },
        { description: { contains: q } },
        { team: { contains: q } },
        { slackHandle: { contains: q } },
        { tools: { some: { tool: { name: { contains: q } } } } },
      ],
    });
  }
  const where = AND.length ? { AND } : {};

  const projects = await prisma.project.findMany({
    where,
    include: { tools: { include: { tool: true } }, links: true },
    orderBy: { createdAt: "desc" },
  });

  const header = [
    "id","title","description","team","ownerName",
    "hoursSavedPerWeek","tools","links","createdAt","updatedAt"
  ].join(",");

  const rows = projects.map((p) => {
    const tools = p.tools.map((pt) => pt.tool.name).join("; ");
    const links = p.links.map((l) => `${l.type}: ${l.url}`).join("; ");
    return [
      esc(p.id),
      esc(p.title),
      esc(p.description),
      esc(p.team),
      esc(p.slackHandle),
      esc(p.hoursSavedPerWeek),
      esc(tools),
      esc(links),
      esc(p.createdAt.toISOString()),
      esc(p.updatedAt.toISOString()),
    ].join(",");
  });

  const csv = [header, ...rows].join("\n");

  return new Response(csv, {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": 'attachment; filename="projects.csv"',
      "cache-control": "no-store",
    },
  });
}

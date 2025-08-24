import { prisma } from "@/lib/prisma";

type SP = Record<string, string | string[] | undefined>;
const asStr = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) || "";

export default async function Projects({ searchParams }: { searchParams?: SP }) {
  const team = asStr(searchParams?.team);
  const owner = asStr(searchParams?.owner);
  const tool = asStr(searchParams?.tool);
  const q = asStr(searchParams?.q);

  const AND: any[] = [];
  if (team) AND.push({ team });
  if (owner) AND.push({ slackHandle: owner });
  if (tool) AND.push({ tools: { some: { tool: { name: tool } } } });

  // SQLite-safe keyword search (no "insensitive" mode flag)
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

  const [projects, teams, owners, tools] = await Promise.all([
    prisma.project.findMany({
      where,
      include: { tools: { include: { tool: true } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.project.findMany({ select: { team: true }, distinct: ["team"] }),
    prisma.project.findMany({ select: { slackHandle: true }, distinct: ["slackHandle"] }),
    prisma.tool.findMany({ orderBy: { name: "asc" } }),
  ]);

  const teamOpts = teams.map((t) => t.team).filter(Boolean).sort();
  const ownerOpts = owners.map((o) => o.slackHandle).filter(Boolean).sort();
  const toolOpts = tools.map((t) => t.name);

  // Build export href with current filters
  const search = new URLSearchParams();
  if (q) search.set("q", q);
  if (team) search.set("team", team);
  if (owner) search.set("owner", owner);
  if (tool) search.set("tool", tool);
  const exportHref = `/api/export${search.toString() ? `?${search.toString()}` : ""}`;

  return (
    <div className="grid">
      <h1 className="text-xl font-semibold">Browse Projects</h1>

      {/* Filters */}
      <form method="GET" className="card grid" style={{ gridTemplateColumns: "repeat(4, 1fr)" }}>
        <label>
          Keyword
          <input name="q" defaultValue={q} placeholder="Search title/description/tools…" />
        </label>
        <label>
          Team
          <select name="team" defaultValue={team}>
            <option value="">All</option>
            {teamOpts.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </label>
        <label>
          Owner
          <select name="owner" defaultValue={owner}>
            <option value="">All</option>
            {ownerOpts.map((o) => (
              <option key={o} value={o}>{o}</option>
            ))}
          </select>
        </label>
        <label>
          Tool
          <select name="tool" defaultValue={tool}>
            <option value="">All</option>
            {toolOpts.map((tn) => (
              <option key={tn} value={tn}>{tn}</option>
            ))}
          </select>
        </label>

        {/* ACTIONS — use <a> styled as buttons (no nesting buttons inside links) */}
        <div style={{ gridColumn: "1 / -1", display: "flex", gap: 8, marginTop: 8 }}>
          <button type="submit">Apply</button>
          <a href="/projects" className="btn-linklike">Clear</a>
          <a href={exportHref} className="btn-linklike" style={{ marginLeft: "auto" }}>Download CSV</a>
        </div>
      </form>

      {/* Results */}
      <ul className="grid">
        {projects.map((p) => (
          <li key={p.id} className="card">
            <a href={`/projects/${p.id}`} className="text-blue-700 font-medium">
              {p.title}
            </a>
            <div className="text-sm text-gray-500">
              {p.team} • Owner {p.slackHandle}
            </div>
            <div className="text-sm mt-1">
              Tools: {p.tools.map((t) => t.tool.name).join(", ") || "—"}
            </div>
            <div className="text-sm mt-1">Hours saved/week: {p.hoursSavedPerWeek}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}


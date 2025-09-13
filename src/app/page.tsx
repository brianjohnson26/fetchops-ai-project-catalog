// src/app/page.tsx
import "server-only";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const revalidate = 0;

type ToolCount = { name: string; count: number };
type LatestProject = { id: number; title: string; team: string; createdAt?: string };
type TeamCount = { team: string; count: number };

type Stats = {
  projectCount: number;
  totalHours: number;
  distinctOwners: number;
  mostCommonTools: ToolCount[];
  latest: LatestProject[];
  teamCounts: TeamCount[];
};

import { prisma } from "@/lib/prisma";
import { TEAMS } from "@/lib/constants";

async function getStats(): Promise<Stats> {
  console.log("Dashboard: Getting fresh stats directly from database...");

  // Force fresh database connection
  await prisma.$disconnect();
  await new Promise((resolve) => setTimeout(resolve, 100));
  await prisma.$connect();

  // Get fresh data directly from database
  const projects = await prisma.project.findMany({
    select: {
      id: true,
      title: true,
      team: true,
      owner: true,
      createdAt: true,
      hoursSavedPerWeek: true,
      tools: { select: { tool: { select: { name: true } } } },
    },
    orderBy: { createdAt: "desc" },
  });

  console.log(`Dashboard: Found ${projects.length} projects directly from DB`);
  console.log(
    "Dashboard: Latest 3 projects:",
    projects.slice(0, 3).map((p) => ({ id: p.id, title: p.title }))
  );

  const projectCount = projects.length;
  const totalHours =
    projects.reduce((sum, p) => sum + (p.hoursSavedPerWeek ?? 0), 0) || 0;
  const distinctOwners = new Set(projects.map((p) => p.owner).filter(Boolean)).size;

  // Tool counts (top 5)
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

  // Latest projects (top 5)
  const latest = projects.slice(0, 5).map((p) => ({
    id: p.id,
    title: p.title,
    team: p.team,
    createdAt: p.createdAt?.toISOString(),
  }));

  // Projects by Team — make sure every TEAMS entry shows up (even zero)
  const rawTeamCounts = new Map<string, number>();
  for (const p of projects) {
    const key = p.team ?? "";
    if (!key) continue;
    rawTeamCounts.set(key, (rawTeamCounts.get(key) ?? 0) + 1);
  }

  // Include any teams that might exist in data but aren't in TEAMS (just in case)
  const dataOnlyTeams = [...rawTeamCounts.keys()].filter((t) => !TEAMS.includes(t as any)).sort();

  const teamCounts: TeamCount[] = [
    ...TEAMS.map((t) => ({ team: t, count: rawTeamCounts.get(t) ?? 0 })),
    ...dataOnlyTeams.map((t) => ({ team: t, count: rawTeamCounts.get(t) ?? 0 })),
  ];

  return {
    projectCount,
    totalHours,
    distinctOwners,
    mostCommonTools,
    latest,
    teamCounts,
  };
}

export default async function Dashboard() {
  let s: Stats;
  try {
    s = await getStats();
  } catch (error) {
    console.error("Failed to fetch stats:", error);
    s = {
      projectCount: 0,
      totalHours: 0,
      distinctOwners: 0,
      mostCommonTools: [],
      latest: [],
      teamCounts: [],
    };
  }

  return (
    <div className="grid" style={{ gridTemplateColumns: "1fr" }}>
      {/* Brand hero */}
      <div className="card hero-card" style={{ padding: 20 }}>
        <h1 style={{ fontSize: "2rem", margin: 0 }}>Fetch AI Project Catalog</h1>
        <div className="small" style={{ marginTop: 6 }}>
          Internal catalog of implemented AI projects, owners, tools, and impact
        </div>
      </div>

      {/* Top stats */}
      <div className="stats-grid">
        <div className="card">
          <div className="text-sm text-gray-500">Total projects</div>
          <div className="text-3xl font-semibold">{s.projectCount}</div>
        </div>
        <div className="card">
          <div className="text-sm text-gray-500">Weekly hours saved</div>
          <div className="text-3xl font-semibold">{s.totalHours}</div>
        </div>
        <div className="card">
          <div className="text-sm text-gray-500">Project Owners</div>
          <div className="text-3xl font-semibold">{s.distinctOwners}</div>
        </div>
        <div className="card">
          <div className="text-sm text-gray-500">Top tools</div>
          <ul className="mt-1">
            {s.mostCommonTools.length === 0 ? (
              <li className="text-gray-500">No tools yet</li>
            ) : (
              s.mostCommonTools.map((t) => (
                <li key={t.name}>
                  {t.name} — {t.count}
                </li>
              ))
            )}
          </ul>
        </div>
      </div>

      {/* Projects by Team */}
      <div className="card">
        <h2 className="text-lg font-semibold">Projects by Team</h2>
        <div
          className="grid mt-2"
          style={{ gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 12 }}
        >
          {s.teamCounts.map((tc) => (
            <div key={tc.team} className="flex items-center justify-between border p-2 rounded">
              <span>{tc.team}</span>
              <span className="font-semibold"> - {tc.count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Latest projects */}
      <div className="card">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Latest Projects</h2>
        </div>
        <ul className="mt-2">
          {s.latest.map((p) => (
            <li key={p.id}>
              <a className="text-blue-700" href={`/projects/${p.id}`}>
                {p.title}
              </a>{" "}
              <span className="text-sm text-gray-500">({p.team})</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

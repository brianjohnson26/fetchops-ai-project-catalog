import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

async function getStats() {
  const [projectCount, toolCounts, totalHours] = await Promise.all([
    prisma.project.count(),
    prisma.tool.findMany({ include: { projects: true } }),
    prisma.project.aggregate({ _sum: { hoursSavedPerWeek: true } }),
  ]);
  const mostCommonTools = toolCounts
    .map((t) => ({ name: t.name, count: t.projects.length }))
    .filter((t) => t.count > 0)
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);
  return {
    projectCount,
    totalHours: totalHours._sum.hoursSavedPerWeek ?? 0,
    mostCommonTools,
    latest: await prisma.project.findMany({ orderBy: { createdAt: "desc" }, take: 5 }),
  };
}

export default async function Dashboard() {
  let s; // Declare s here

  try {
    s = await getStats();
  } catch (error) {
    console.error("Failed to fetch stats:", error);
    // Provide fallback data in case of an error
    s = {
      projectCount: 0,
      totalHours: 0,
      mostCommonTools: [],
      latest: [],
    };
  }

  return (
    <div className="grid" style={{ gridTemplateColumns: "1fr" }}>
      {/* Brand hero */}
      <div className="card hero-card" style={{ padding: 20 }}>
        <h1 style={{ fontSize: "2rem", margin: 0 }}>Fetch Operations AI Project Catalog</h1>
        <div className="small" style={{ marginTop: 6 }}>
          Internal catalog of implemented AI projects, owners, tools, and impact
        </div>
      </div>

      {/* Top stats */}
      <div className="grid" style={{ gridTemplateColumns: "repeat(3, 1fr)" }}>
        <div className="card">
          <div className="text-sm text-gray-500">Total projects</div>
          <div className="text-3xl font-semibold">{s.projectCount}</div>
        </div>
        <div className="card">
          <div className="text-sm text-gray-500">Weekly hours saved</div>
          <div className="text-3xl font-semibold">{s.totalHours}</div>
        </div>
        <div className="card">
          <div className="text-sm text-gray-500">Top tools</div>
          <ul className="mt-1">
            {s.mostCommonTools.map((t) => (
              <li key={t.name}>
                {t.name} — {t.count}
              </li>
            ))}
          </ul>
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
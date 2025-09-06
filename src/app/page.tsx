import "server-only";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type ToolCount = { name: string; count: number };
type LatestProject = { id: number; title: string; team: string; createdAt?: string };

type Stats = {
  projectCount: number;
  totalHours: number;
  mostCommonTools: ToolCount[];
  latest: LatestProject[];
};

async function getStats(): Promise<Stats> {
  const base = process.env.NEXTAUTH_URL || "";
  // Add timestamp to prevent any caching issues
  const timestamp = Date.now();
  const res = await fetch(`${base}/api/home-stats?t=${timestamp}`, { 
    cache: "no-store",
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache'
    }
  });
  if (!res.ok) {
    throw new Error(`home-stats failed: ${res.status}`);
  }
  const data = await res.json();

  return {
    projectCount: data.projectCount ?? 0,
    totalHours: data.totalHours ?? 0,
    mostCommonTools: (data.mostCommonTools ?? []) as ToolCount[],
    latest: (data.latest ?? []) as LatestProject[],
  };
}

export default async function Dashboard() {
  let s: Stats;
  try {
    s = await getStats();
  } catch (error) {
    console.error("Failed to fetch stats:", error);
    s = { projectCount: 0, totalHours: 0, mostCommonTools: [], latest: [] };
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

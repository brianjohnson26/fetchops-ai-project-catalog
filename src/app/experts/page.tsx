import { prisma } from "@/lib/prisma";

type SP = Record<string, string | string[] | undefined>;
const asStr = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) || "";

export default async function Experts({ searchParams }: { searchParams?: SP }) {
  const toolName = asStr(searchParams?.tool);

  const tools = await prisma.tool.findMany({ orderBy: { name: "asc" } });

  let results: { owner: string; count: number }[] = [];
  if (toolName) {
    const projects = await prisma.project.findMany({
      where: { tools: { some: { tool: { name: toolName } } } },
      select: { owner: true },
    });
    const counts = new Map<string, number>();
    for (const p of projects) {
      const name = (p.owner || "").trim();
      if (!name) continue;
      counts.set(name, (counts.get(name) || 0) + 1);
    }
    results = Array.from(counts.entries())
      .map(([owner, count]) => ({ owner, count }))
      .sort((a, b) => (b.count - a.count) || a.owner.localeCompare(b.owner));
  }

  return (
    <div className="grid">
      <h1 className="text-xl font-semibold">Find an expert</h1>

      <form method="GET" className="card grid" style={{ gridTemplateColumns: "1fr auto" }}>
        <label>
          Tool
          <select name="tool" defaultValue={toolName}>
            <option value="">— Select a tool —</option>
            {tools.map(t => (
              <option key={t.id} value={t.name}>{t.name}</option>
            ))}
          </select>
        </label>
        <div style={{ alignSelf: "end" }}>
          <button type="submit">Search</button>
        </div>
      </form>

      {toolName && (
        <div className="card">
          <h2 className="font-semibold">People with “{toolName}” projects</h2>
          <ul className="mt-2">
            {results.map(r => (
              <li key={r.owner}>{r.owner} — {r.count} project{r.count === 1 ? "" : "s"}</li>
            ))}
            {results.length === 0 && <li className="small">No matches yet.</li>}
          </ul>
        </div>
      )}
    </div>
  );
}

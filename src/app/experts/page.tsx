import { prisma } from "@/lib/prisma";

export default async function Experts({ searchParams }: { searchParams?: Record<string, string | string[]> }) {
  const tools = await prisma.tool.findMany({ orderBy: { name: "asc" } });
  const toolId = searchParams?.tool ? Number(searchParams.tool) : null;

  let results: { handle: string, count: number }[] = [];
  if (toolId) {
    const projects = await prisma.project.findMany({
      where: { tools: { some: { toolId } } }
    });
    const counts = new Map<string, number>();
    for (const p of projects) {
      counts.set(p.slackHandle, (counts.get(p.slackHandle) || 0) + 1);
    }
    results = Array.from(counts.entries()).map(([handle, count]) => ({ handle, count }))
      .sort((a,b) => b.count - a.count);
  }

  return (
    <div className="grid">
      <h1 className="text-xl font-semibold">Find an Expert</h1>
      <form method="GET" className="card">
        <label>Tool
          <select name="tool" defaultValue={toolId ?? ""}>
            <option value="">Select a tool</option>
            {tools.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
        </label>
        <button className="rounded bg-blue-600 text-white px-3 py-1.5 text-sm hover:bg-blue-700" type="submit">Search</button>
      </form>

      {toolId && (
        <div className="card">
          <h2 className="font-semibold">People who built with this tool</h2>
          {results.length === 0 ? <div>None yet.</div> : (
            <ul className="mt-2">
              {results.map(r => (
                <li key={r.handle}>
                  <a className="text-blue-700" href={`https://slack.com/app_redirect?channel=${r.handle.replace("@","")}`} target="_blank">
                    {r.handle}
                  </a> — {r.count} project(s)
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

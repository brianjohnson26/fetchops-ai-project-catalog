import { prisma } from "@/lib/prisma";

export default async function Projects() {
  const projects = await prisma.project.findMany({
    include: { tools: { include: { tool: true } } },
    orderBy: { createdAt: "desc" }
  });
  return (
    <div className="grid">
      <h1 className="text-xl font-semibold">Browse Projects</h1>
      <ul className="grid">
        {projects.map(p => (
          <li key={p.id} className="card">
            <a href={`/projects/${p.id}`} className="text-blue-700 font-medium">{p.title}</a>
            <div className="text-sm text-gray-500">{p.team} • Owner {p.slackHandle}</div>
            <div className="text-sm mt-1">Tools: {p.tools.map(t => t.tool.name).join(", ") || "—"}</div>
            <div className="text-sm mt-1">Hours saved/week: {p.hoursSavedPerWeek}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}

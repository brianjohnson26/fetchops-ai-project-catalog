import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function ProjectsPage({
  searchParams,
}: {
  searchParams?: { q?: string };
}) {
  const q = typeof searchParams?.q === "string" ? searchParams.q.trim() : "";

  const OR = q
    ? [
        { title: { contains: q } },
        { description: { contains: q } },
        { team: { contains: q } },
        { owner: { contains: q } },
        // NEW: search the three added fields
        { howYouBuiltIt: { contains: q } },
        { challengesSolutionsTips: { contains: q } },
        { otherImpacts: { contains: q } },
        // search tool names
        { tools: { some: { tool: { name: { contains: q } } } } },
      ]
    : undefined;

  const projects = await prisma.project.findMany({
    where: { OR },
    orderBy: { createdAt: "desc" },
    include: {
      tools: { include: { tool: true } },
      links: true,
    },
  });

  return (
    <div className="grid gap-4">
      <form className="card" style={{ display: "flex", gap: 8 }}>
        <input
          type="text"
          name="q"
          defaultValue={q}
          placeholder="Search title, description, team, owner, tools…"
        />
        <button type="submit">Search</button>
      </form>

      {projects.length === 0 && (
        <div className="p-4">No projects found.</div>
      )}

      <ul className="grid" style={{ gridTemplateColumns: "1fr" }}>
        {projects.map((p) => (
          <li key={p.id} className="card space-y-2">
            {/* Title */}
            <h3 className="text-lg font-semibold">
              <Link href={`/projects/${p.id}`}>{p.title}</Link>
            </h3>

            {/* Team & Owner */}
            <div className="text-sm opacity-80">
              Team: <span className="font-medium">{p.team || "—"}</span>,{" "}
              Owner: <span className="font-medium">{p.owner || "—"}</span>
            </div>

            {/* Description */}
            <p className="mt-1">{p.description}</p>

            {/* Tools */}
            {p.tools.length > 0 && (
              <div className="text-sm opacity-80">
                Tools: {p.tools.map((t) => t.tool.name).join(", ")}
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

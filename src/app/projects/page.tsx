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
        { slackHandle: { contains: q } },
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
          <li key={p.id} className="card">
            <div className="flex items-center justify-between">
              <Link href={`/projects/${p.id}`} className="font-semibold">
                {p.title}
              </Link>
              <span className="text-sm opacity-70">{p.team}</span>
            </div>
            <p className="mt-1 line-clamp-2">{p.description}</p>

            {/* Show quick hints if the new fields exist */}
            <div className="mt-2 text-sm space-y-1">
              {p.howYouBuiltIt && (
                <div className="opacity-80">
                  <span className="font-medium">Built:</span>{" "}
                  <span className="line-clamp-1">{p.howYouBuiltIt}</span>
                </div>
              )}
              {p.challengesSolutionsTips && (
                <div className="opacity-80">
                  <span className="font-medium">Tips:</span>{" "}
                  <span className="line-clamp-1">{p.challengesSolutionsTips}</span>
                </div>
              )}
              {p.otherImpacts && (
                <div className="opacity-80">
                  <span className="font-medium">Impacts:</span>{" "}
                  <span className="line-clamp-1">{p.otherImpacts}</span>
                </div>
              )}
            </div>

            {p.tools.length > 0 && (
              <div className="mt-2 text-sm opacity-80">
                Tools: {p.tools.map((t) => t.tool.name).join(", ")}
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

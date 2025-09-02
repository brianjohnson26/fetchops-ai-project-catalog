// src/app/projects/page.tsx
import { prisma } from "@/lib/prisma";
import BrowseFilters, { type Project as BrowseProject } from "@/components/BrowseFilters";

export const dynamic = "force-dynamic";

async function getProjects(): Promise<BrowseProject[]> {
  try {
    const rows = await prisma.project.findMany({
      select: {
        id: true,
        title: true,
        description: true,
        team: true,
        owner: true,
        howYouBuiltIt: true,
        challengesSolutionsTips: true,
        otherImpacts: true,
        tools: {
          select: {
            tool: { select: { name: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return rows.map((r) => ({
      id: String(r.id),
      title: r.title ?? "(Untitled)",
      // synthesize a summary for the filter/search card
      summary:
        r.description ??
        r.howYouBuiltIt ??
        r.challengesSolutionsTips ??
        r.otherImpacts ??
        null,
      team: r.team ?? null,
      owner: r.owner ?? null,
      tools: r.tools.map((t) => t.tool.name),
    }));
  } catch (err) {
    console.error("Failed to load projects:", err);
    return [];
  }
}

export default async function ProjectsPage() {
  const projects = await getProjects();

  return (
    <main className="max-w-7xl mx-auto px-4 py-8">
      <header className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold">Browse AI Projects</h1>
        <p className="text-sm text-gray-600 mt-1">
          Filter by keyword, team, owner, and tools.
        </p>
      </header>

      <BrowseFilters projects={projects} />

      {projects.length === 0 && (
        <div className="mt-6 rounded-xl border p-4 text-sm text-gray-700">
          No projects found in the database yet. Add a project on the Admin page,
          then refresh this page.
        </div>
      )}
    </main>
  );
}
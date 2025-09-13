// src/app/projects/page.tsx
import { prisma } from "@/lib/prisma";
import BrowseFilters, { type Project as BrowseProject } from "@/components/BrowseFilters";
import { TEAMS } from "@/lib/constants";

export const dynamic = "force-dynamic";

async function getProjects(): Promise<BrowseProject[]> {
  try {
    console.log("Projects page: Starting to fetch projects...");

    // Force fresh database connection
    await prisma.$disconnect();
    await new Promise((resolve) => setTimeout(resolve, 100));
    await prisma.$connect();

    const rows = await prisma.project.findMany({
      select: {
        id: true,
        title: true,
        description: true,
        team: true,
        owner: true,
        deploymentDate: true,
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

    console.log(`Projects page: Found ${rows.length} projects`);
    if (rows.length > 0) {
      console.log("Projects page: First project:", { id: rows[0].id, title: rows[0].title });
    }

    const result = rows.map((r) => ({
      id: String(r.id),
      title: r.title ?? "(Untitled)",
      summary: r.description || null,
      team: r.team ?? null,
      owner: r.owner ?? null,
      deploymentDate: r.deploymentDate?.toISOString() || null,
      tools: r.tools,
    }));

    console.log(`Projects page: Returning ${result.length} projects`);
    return result;
  } catch (err) {
    console.error("Projects page: Error fetching projects:", err);
    return [];
  }
}

export default async function ProjectsPage() {
  const projects = await getProjects();

  // Build filter sources
  const projectTeams = Array.from(new Set(projects.map((p) => p.team).filter(Boolean))) as string[];
  const allTeams = Array.from(new Set([...TEAMS, ...projectTeams])).sort();
  const allOwners = Array.from(new Set(projects.map((p) => p.owner).filter(Boolean))) as string[];
  const allTools = Array.from(new Set(projects.flatMap((p) => p.tools.map((t) => t.tool.name)))).sort();

  return (
    <BrowseFilters 
      projects={projects}
      allTeams={allTeams}
      allOwners={allOwners}
      allTools={allTools}
    />
  );
}

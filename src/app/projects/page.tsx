// src/app/projects/page.tsx
import { prisma } from "@/lib/prisma";
import BrowseFilters, { type Project as BrowseProject } from "@/components/BrowseFilters";

export const dynamic = "force-dynamic";

async function getProjects(): Promise<BrowseProject[]> {
  const maxRetries = 3;
  let attempt = 0;
  
  while (attempt < maxRetries) {
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
        // synthesize a summary for the filter/search card - use description first to preserve line breaks
        summary: r.description || null,
        team: r.team ?? null,
        owner: r.owner ?? null,
        tools: r.tools,
      }));
    } catch (err) {
      attempt++;
      console.error(`Failed to load projects (attempt ${attempt}/${maxRetries}):`, err);
      
      if (attempt >= maxRetries) {
        console.error("Max retries reached, returning empty array");
        return [];
      }
      
      // Wait before retrying (exponential backoff)
      await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
    }
  }
  
  return [];
}

export default async function ProjectsPage() {
  const projects = await getProjects();

  // Extract unique values for filters
  const allTeams = Array.from(new Set(projects.map(p => p.team).filter(Boolean))) as string[];
  const allOwners = Array.from(new Set(projects.map(p => p.owner).filter(Boolean))) as string[];
  const allTools = Array.from(new Set(projects.flatMap(p => p.tools.map(t => t.tool.name))));

  return (
    <BrowseFilters 
      projects={projects} 
      allTeams={allTeams}
      allOwners={allOwners}
      allTools={allTools}
    />
  );
}
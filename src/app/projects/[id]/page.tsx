// src/app/projects/[id]/page.tsx
import React from "react";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { notFound } from "next/navigation";
import ProjectActions from "@/components/ProjectActions";
import { getAuthSession } from "@/lib/auth";
import { TEAMS } from "@/lib/constants";

export default async function ProjectPage({ params }: { params: { id: string } }) {
  const id = Number(params.id);
  if (isNaN(id)) {
    notFound();
  }

  const project = await prisma.project.findUnique({
    where: { id },
    include: {
      tools: { include: { tool: true } },
      links: true,
    },
  });

  if (!project) {
    notFound();
  }

  // Check if user is admin
  const session = await getAuthSession();
  const isAdmin = !!session?.user?.email?.endsWith("@fetchrewards.com");

  // Team display stays human-friendly but flags legacy/non-canonical values
  const displayTeam = project.team
    ? (TEAMS.includes(project.team as (typeof TEAMS)[number]) ? project.team : `${project.team} (unlisted)`)
    : "";

  return (
    <main className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-6">
        <Link href="/projects" className="text-blue-700 hover:underline">
          ← Back to Projects
        </Link>
      </div>

      <div className="bg-white border rounded-2xl p-6">
        <div className="mb-4">
          <h1 className="text-3xl font-bold mb-4">{project.title}</h1>
          {isAdmin && <ProjectActions projectId={project.id} />}
        </div>

        <div className="grid gap-6">
          <div>
            <h2 className="text-lg font-semibold mb-2">Description</h2>
            <div className="text-gray-700 leading-relaxed" style={{ whiteSpace: "pre-line" }}>
              {project.description}
            </div>
          </div>

          {project.howYouBuiltIt && (
            <div>
              <h2 className="text-lg font-semibold mb-2">How You Built It</h2>
              <div className="text-gray-700 leading-relaxed" style={{ whiteSpace: "pre-line" }}>
                {project.howYouBuiltIt}
              </div>
            </div>
          )}

          {project.challengesSolutionsTips && (
            <div>
              <h2 className="text-lg font-semibold mb-2">Challenges / Solutions / Tips</h2>
              <div className="text-gray-700 leading-relaxed" style={{ whiteSpace: "pre-line" }}>
                {project.challengesSolutionsTips}
              </div>
            </div>
          )}

          {project.otherImpacts && (
            <div>
              <h2 className="text-lg font-semibold mb-2">Other Impacts</h2>
              <div className="text-gray-700 leading-relaxed" style={{ whiteSpace: "pre-line" }}>
                {project.otherImpacts}
              </div>
            </div>
          )}

          {project.nextSteps && (
            <div>
              <h2 className="text-lg font-semibold mb-2">Next Steps / Future Enhancements</h2>
              <div className="text-gray-700 leading-relaxed" style={{ whiteSpace: "pre-line" }}>
                {project.nextSteps}
              </div>
            </div>
          )}

          {project.otherNotes && (
            <div>
              <h2 className="text-lg font-semibold mb-2">Other Notes</h2>
              <div className="text-gray-700 leading-relaxed" style={{ whiteSpace: "pre-line" }}>
                {project.otherNotes}
              </div>
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h2 className="text-lg font-semibold mb-2">Project Details</h2>
              <div className="space-y-2">
                <div><strong>Team:</strong> {displayTeam}</div>
                <div><strong>Owner:</strong> {project.owner}</div>
                <div><strong>Hours Saved/Week:</strong> {project.hoursSavedPerWeek}</div>
                {project.deploymentDate && (
                  <div>
                    <strong>Deployment Date:</strong>{" "}
                    {new Date(project.deploymentDate).toLocaleDateString("en-US", {
                      timeZone: "UTC"
                    })}
                  </div>
                )}
                <div><strong>Created:</strong> {project.createdAt.toLocaleDateString()}</div>
              </div>
            </div>

            <div>
              <h2 className="text-lg font-semibold mb-2">Tools Used</h2>
              <div className="flex flex-col gap-1 mt-1">
                {project.tools.map((pt) => (
                  <div key={pt.tool.name} className="text-black">
                    {pt.tool.name}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {project.links.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold mb-2">Links</h2>
              <div className="space-y-2">
                {project.links.map((link, index) => (
                  <div key={index}>
                    <span className="inline-block w-16 text-sm font-medium">{link.type}:</span>
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-700 hover:underline"
                    >
                      {link.url}
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

import React from "react";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { notFound } from "next/navigation";

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

  return (
    <main className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-6">
        <Link href="/projects" className="text-blue-700 hover:underline">
          ← Back to Projects
        </Link>
      </div>

      <div className="bg-white border rounded-2xl p-6">
        <div className="flex justify-between items-start mb-4">
          <h1 className="text-3xl font-bold">{project.title}</h1>
          <div className="flex gap-2">
            <Link 
              href={`/projects/${project.id}/edit`}
              className="px-3 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
            >
              Edit
            </Link>
            <form method="POST" action={`/projects/${project.id}/delete`} className="inline">
              <button 
                type="submit"
                className="px-3 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200"
                onClick={(e) => {
                  if (!confirm('Are you sure you want to delete this project?')) {
                    e.preventDefault();
                  }
                }}
              >
                Delete
              </button>
            </form>
          </div>
        </div>

        <div className="grid gap-6">
          <div>
            <h2 className="text-lg font-semibold mb-2">Description</h2>
            <p className="text-gray-700 whitespace-pre-wrap">{project.description}</p>
          </div>

          {project.howYouBuiltIt && (
            <div>
              <h2 className="text-lg font-semibold mb-2">How You Built It</h2>
              <p className="text-gray-700 whitespace-pre-wrap">{project.howYouBuiltIt}</p>
            </div>
          )}

          {project.challengesSolutionsTips && (
            <div>
              <h2 className="text-lg font-semibold mb-2">Challenges / Solutions / Tips</h2>
              <p className="text-gray-700 whitespace-pre-wrap">{project.challengesSolutionsTips}</p>
            </div>
          )}

          {project.otherImpacts && (
            <div>
              <h2 className="text-lg font-semibold mb-2">Other Impacts</h2>
              <p className="text-gray-700 whitespace-pre-wrap">{project.otherImpacts}</p>
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h2 className="text-lg font-semibold mb-2">Project Details</h2>
              <div className="space-y-2">
                <div><strong>Team:</strong> {project.team}</div>
                <div><strong>Owner:</strong> {project.owner}</div>
                <div><strong>Hours Saved/Week:</strong> {project.hoursSavedPerWeek}</div>
                <div><strong>Created:</strong> {project.createdAt.toLocaleDateString()}</div>
              </div>
            </div>

            <div>
              <h2 className="text-lg font-semibold mb-2">Tools Used</h2>
              <div className="flex flex-wrap gap-2">
                {project.tools.map((t) => (
                  <span 
                    key={t.tool.id} 
                    className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-sm"
                  >
                    {t.tool.name}
                  </span>
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

import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function ProjectPage({ params }: { params: { id: string } }) {
  const project = await prisma.project.findUnique({
    where: { id: Number(params.id) },
    include: { tools: { include: { tool: true } }, links: true },
  });

  if (!project) {
    return <div className="p-4">Project not found</div>;
  }

  return (
    <div className="grid gap-4">
      <h1 className="text-2xl font-bold">{project.title}</h1>
      <p className="whitespace-pre-line">{project.description}</p>

      {/* NEW FIELDS */}
      {project.howYouBuiltIt && (
        <div>
          <h2 className="font-semibold">How You Built It</h2>
          <p className="whitespace-pre-line">{project.howYouBuiltIt}</p>
        </div>
      )}

      {project.challengesSolutionsTips && (
        <div>
          <h2 className="font-semibold">Challenges / Solutions / Tips</h2>
          <p className="whitespace-pre-line">{project.challengesSolutionsTips}</p>
        </div>
      )}

      {project.otherImpacts && (
        <div>
          <h2 className="font-semibold">Other Qualitative or Quantitative Impacts</h2>
          <p className="whitespace-pre-line">{project.otherImpacts}</p>
        </div>
      )}

      <div>
        <h2 className="font-semibold">Team</h2>
        <p>{project.team}</p>
      </div>

      <div>
        <h2 className="font-semibold">Owner</h2>
        <p>{project.owner}</p>
      </div>

      <div>
        <h2 className="font-semibold">Hours Saved / Week</h2>
        <p>{project.hoursSavedPerWeek}</p>
      </div>

      <div>
        <h2 className="font-semibold">Tools Used</h2>
        <ul>
          {project.tools.map((t) => (
            <li key={t.toolId}>{t.tool.name}</li>
          ))}
        </ul>
      </div>

      {project.links.length > 0 && (
        <div>
          <h2 className="font-semibold">Links</h2>
          <ul>
            {project.links.map((l) => (
              <li key={l.id}>
                <Link href={l.url} target="_blank">
                  {l.type}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function ProjectDetail({ params }: { params: { id: string } }) {
  const id = Number(params.id);
  const p = await prisma.project.findUnique({
    where: { id },
    include: {
      tools: { include: { tool: true } },
      links: true
    }
  });
  if (!p) return <div className="card">Not found.</div>;
  return (
    <div className="grid">
      <div className="card">
        <h1 className="text-xl font-semibold">{p.title}</h1>
        <div className="text-sm text-gray-500">{p.team} • Owner {p.slackHandle}</div>
        <p className="mt-2 whitespace-pre-wrap">{p.description}</p>
        <div className="mt-2 text-sm">Tools: {p.tools.map(t => t.tool.name).join(", ") || "—"}</div>
        <div className="mt-1 text-sm">Hours saved/week: {p.hoursSavedPerWeek}</div>
        <div className="mt-3">
          <h3 className="font-semibold">Links</h3>
          <ul className="list-disc pl-6">
            {p.links.map(l => (<li key={l.id}><a className="text-blue-700" href={l.url} target="_blank">{l.type}</a></li>))}
            {p.links.length === 0 && <li>—</li>}
          </ul>
        </div>
        <div className="mt-4 text-sm">
          <Link href="/projects" className="text-blue-700">← Back</Link>
        </div>
      </div>
    </div>
  );
}

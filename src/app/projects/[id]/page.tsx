import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

export default async function ProjectDetail({ params }: { params: { id: string } }) {
  const id = Number(params.id);
  const p = await prisma.project.findUnique({
    where: { id },
    include: { tools: { include: { tool: true } }, links: true },
  });
  if (!p) return <div className="card">Not found.</div>;

  const isAdmin = cookies().get("admin_session")?.value === "1";

  return (
    <div className="grid">
      <div className="card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", gap: 12 }}>
          <div>
            <h1 className="text-xl font-semibold">{p.title}</h1>
            <div className="text-sm text-gray-500">{p.team} • Owner {p.slackHandle}</div>
          </div>

          {isAdmin && (
            <div style={{ display: "flex", gap: 8 }}>
              <a href={`/projects/${p.id}/edit`} className="btn-linklike">Edit</a>
              <form method="POST" action={`/projects/${p.id}/delete`} style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <button type="submit" style={{ background: "#b91c1c" }}>Delete</button>
              </form>
            </div>
          )}
        </div>

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

        <div className="mt-4 text-sm flex gap-4">
          <Link href="/projects" className="text-blue-700">← Back</Link>
          {p.team && <Link href={`/projects?team=${encodeURIComponent(p.team)}`} className="text-blue-700">More in {p.team}</Link>}
        </div>
      </div>
    </div>
  );
}

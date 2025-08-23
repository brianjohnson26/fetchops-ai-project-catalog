import { prisma } from "@/lib/prisma";
import { z } from "zod";

export default async function NewProject() {
  const tools = await prisma.tool.findMany({ orderBy: { name: "asc" } });
  return (
    <div className="grid">
      <h1 className="text-xl font-semibold">Add Project</h1>
      <form method="POST" action="/projects/new/submit" className="card grid" style={{gridTemplateColumns: "1fr"}}>
        <label>Admin Key<input name="adminKey" defaultValue="" placeholder="Ask Brian/owner" required/></label>
        <label>Title<input name="title" placeholder="e.g., Automatic Ticket Triage" required/></label>
        <label>Description<textarea name="description" rows={5} placeholder="What it does, who uses it, benefits" required/></label>
        <label>Team<input name="team" placeholder="Support, Fraud, etc." required/></label>
        <label>Owner Slack Handle<input name="slackHandle" placeholder="@someone" required/></label>
        <label>Hours Saved / Week<input type="number" name="hoursSavedPerWeek" min={0} defaultValue={0} /></label>
        <label>Tools (choose multiple)</label>
        <div className="grid" style={{gridTemplateColumns: "repeat(3, 1fr)"}}>
          {tools.map(t => (
            <label key={t.id} className="flex gap-2 items-center">
              <input type="checkbox" name="toolIds" value={t.id} /> {t.name}
            </label>
          ))}
        </div>
        <button className="rounded bg-blue-600 text-white px-3 py-1.5 text-sm hover:bg-blue-700" type="submit">Create</button>
      </form>
    </div>
  );
}

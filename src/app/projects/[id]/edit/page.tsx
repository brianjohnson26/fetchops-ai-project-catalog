import React from "react";
import { prisma } from "@/lib/prisma";
import { getAuthSession } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";

async function getProject(id: number) {
  return await prisma.project.findUnique({
    where: { id },
    include: {
      tools: { include: { tool: true } },
      links: true,
    },
  });
}

async function getAllToolNames(): Promise<string[]> {
  const tools = await prisma.tool.findMany({
    select: { name: true },
    orderBy: { name: "asc" },
  });
  return tools.map(t => t.name);
}

const GROUPS: { key: string; label: string; items: string[] }[] = [
  {
    key: "llms",
    label: "LLMs / Chatbots",
    items: ["ChatGPT (OpenAI)", "Claude (Anthropic)", "Comet (Perplexity)", "CustomGPT", "Gemini (Google)"]
  },
  {
    key: "fetch",
    label: "Fetch Tools",
    items: [
      "Fetch Backend APIs",
      "FetchGPT",
      "FOCR Dash",
      "Fraudal",
      "MC Businesses",
      "MC Catalog",
      "MC Launch Pad",
      "Orbit",
      "PAM Dash",
      "RAD",
      "Receipt Manager",
      "Retailer Admin",
      "Supportal",
      "ZAF"
    ],
  },
  {
    key: "apps",
    label: "Core 3P Platforms / Integrations",
    items: [
      "Agent Assist (Forethought)",
      "Confluence",
      "Google Docs",
      "Google Drive",
      "Google Sheets",
      "Google Slides",
      "Jira",
      "Kount",
      "Scout (Forethought)",
      "Slack",
      "Zendesk"
    ]
  },
  {
    key: "data",
    label: "Data",
    items: ["Airtable", "Grafana", "Hex", "Snowflake", "Supabase", "Tableau", "Unblocked"]
  },
  {
    key: "automation",
    label: "AI / Automation / Coding & Dev Frameworks",
    items: [
      "Bitbucket",
      "ChatGPT Agent",
      "Chrome Extension",
      "Cursor",
      "Express",
      "Gamma",
      "Github",
      "Google Apps Script",
      "Loveable",
      "n8n",
      "Node.JS",
      "NotebookLM",
      "Open AI API",
      "Playwright",
      "Python",
      "Replit",
      "Slackbots / API",
      "Streamlit",
      "VS Code",
      "Zapier",
      "Zendesk API / Macros"
    ],
  },
];

export default async function EditProjectPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams?: { ok?: string; error?: string };
}) {
  const session = await getAuthSession();
  const isAdmin = !!session?.user?.email?.endsWith("@fetchrewards.com");

  if (!isAdmin) {
    redirect("/admin");
  }

  const projectId = Number(params.id);
  if (isNaN(projectId)) {
    notFound();
  }

  const project = await getProject(projectId);
  if (!project) {
    notFound();
  }

  const allToolNames = await getAllToolNames();

  return (
    <div>
      {searchParams?.ok && (
        <div className="card success">Project updated successfully!</div>
      )}
      {searchParams?.error && (
        <div className="card error">Failed to update project. Please try again.</div>
      )}

      <div className="card">
        <h1>Edit Project</h1>
        <form action={`/projects/${project.id}/edit/submit`} method="post">
          <div className="form-group">
            <label htmlFor="title">Title *</label>
            <input
              type="text"
              id="title"
              name="title"
              defaultValue={project.title}
              required
            />
          </div>

          {/* Admin & basics */}
          <label>Description<textarea name="description" rows={5} defaultValue={project.description} required /></label>

          {/* NEW FIELDS */}
          <label>
            How You Built It
            <textarea
              name="howYouBuiltIt"
              rows={4}
              placeholder="Workflow summary and/or diagram notes"
              defaultValue={project.howYouBuiltIt || ""}
            />
          </label>

          <label>
            Challenges / Solutions / Tips
            <textarea
              name="challengesSolutionsTips"
              rows={4}
              placeholder="What was hard? How did you solve it? Any advice for others?"
              defaultValue={project.challengesSolutionsTips || ""}
            />
          </label>

          <label>Hours Saved / Week<input type="number" name="hoursSavedPerWeek" min={0} defaultValue={project.hoursSavedPerWeek} /></label>

          <label>
            Deployment Date
            <input
              type="date"
              name="deploymentDate"
              defaultValue={project.deploymentDate ? new Date(project.deploymentDate).toISOString().split('T')[0] : ""}
            />
          </label>

          <label>
            Other Qualitative or Quantitative Impacts
            <textarea
              name="otherImpacts"
              rows={4}
              placeholder="e.g., quality improvements, NPS, CSAT, fewer escalations, speedups, accuracy deltas, etc."
              defaultValue={project.otherImpacts || ""}
            />
          </label>

          <label>
            Next Steps / Future Enhancements
            <textarea
              name="nextSteps"
              rows={4}
              placeholder="What improvements or additional features are planned? What would you like to build next?"
              defaultValue={project.nextSteps || ""}
            />
          </label>

          {/* Team picklist */}
          <label>
            Team
            <select name="team" defaultValue={project.team} required>
              <option value="">Select a team</option>
              <option value="Fraud">Fraud</option>
              <option value="Implementation">Implementation</option>
              <option value="Ops Data">Ops Data</option>
              <option value="Receipt Quality">Receipt Quality</option>
              <option value="Support">Support</option>
            </select>
          </label>

          <label>Owner<input name="owner" defaultValue={project.owner} required /></label>

          {/* Links (prefill up to 3) */}
          <fieldset className="card" style={{ padding: 12 }}>
            <legend className="text-sm" style={{ padding: "0 6px" }}>Links</legend>
            {[1, 2, 3].map((i) => {
              const L = project.links[i - 1] || null;
              return (
                <div key={i} className="grid" style={{ gridTemplateColumns: "200px 1fr", gap: 12, alignItems: "end", marginTop: i === 1 ? 0 : 8 }}>
                  <label>
                    Type
                    <select name={`link_type_${i}`} defaultValue={L?.type || "Tool/Homepage"}>
                      <option value="Tool/Homepage">Tool/Homepage</option>
                      <option value="Demo">Demo</option>
                      <option value="Jira">Jira</option>
                      <option value="Other">Other</option>
                    </select>
                  </label>
                  <label>
                    URL
                    <input name={`link_url_${i}`} placeholder="https://…" defaultValue={L?.url || ""} />
                  </label>
                </div>
              );
            })}
            <div className="small mt-2">Leave any row blank to omit it.</div>
          </fieldset>

          {/* Grouped tools */}
          <div className="grid" style={{ gridTemplateColumns: "1fr" }}>
            <h2 className="font-semibold">Tools Used</h2>
            {GROUPS.map((g) => (
              <fieldset key={g.key} className="card" style={{ padding: 12 }}>
                <legend className="text-sm" style={{ padding: "0 6px" }}>{g.label}</legend>
                <div className="grid" style={{ gridTemplateColumns: "repeat(3, minmax(0, 1fr))" }}>
                  {g.items.map((name) => {
                    const isChecked = project.tools.some(pt => pt.tool.name === name);
                    return (
                      <label key={name} className="flex items-center gap-2">
                        <input type="checkbox" name="toolNames" value={name} defaultChecked={isChecked} /> {name}
                      </label>
                    );
                  })}
                </div>
              </fieldset>
            ))}

            {/* Single Other field for all categories */}
            <fieldset className="card" style={{ padding: 12 }}>
              <legend className="text-sm" style={{ padding: "0 6px" }}>Other Tools</legend>
              <label>
                Other tools not listed above (comma-separated)
                <input name="other_tools" placeholder="e.g., Cohere, Supabase Functions, Custom API" defaultValue={
                  project.tools
                    .map(pt => pt.tool.name)
                    .filter(name => !GROUPS.some(g => g.items.includes(name)))
                    .join(", ")
                } />
              </label>
            </fieldset>
          </div>

          <button type="submit" className="button">
            Update Project
          </button>
        </form>
      </div>
    </div>
  );
}
import React from "react";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

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

export default async function EditProject({ params }: { params: { id: string } }) {
  const id = Number(params.id);
  const p = await prisma.project.findUnique({
    where: { id },
    include: { tools: { include: { tool: true } }, links: true },
  });
  if (!p) return <div className="card">Not found. <Link className="text-blue-700" href="/projects">← Back</Link></div>;

  const current = new Set(p.tools.map(t => t.tool.name));
  const link1 = p.links[0]; const link2 = p.links[1]; const link3 = p.links[2];
  
  // Separate predefined tools from other tools
  const allPredefinedTools = new Set(GROUPS.flatMap(g => g.items));
  const otherTools = p.tools
    .map(t => t.tool.name)
    .filter(name => !allPredefinedTools.has(name))
    .join(", ");

  return (
    <div className="grid">
      <div className="card">
        <h1 className="text-xl font-semibold">Edit Project</h1>
        <div className="small">ID #{p.id} • Owner {p.owner}</div>
      </div>

      {/* Point to the new submit route */}
      <form method="POST" action={`/projects/${p.id}/edit/submit`} className="card grid" style={{ gridTemplateColumns: "1fr" }}>
        {/* Admin & basics */}
        <label>Title<input name="title" defaultValue={p.title} required /></label>
        <label>Description<textarea name="description" rows={5} defaultValue={p.description} required /></label>

        {/* NEW FIELDS */}
        <label>
          How You Built It
          <textarea
            name="howYouBuiltIt"
            rows={4}
            placeholder="Workflow summary and/or diagram notes"
            defaultValue={p.howYouBuiltIt || ""}
          />
        </label>

        <label>
          Challenges / Solutions / Tips
          <textarea
            name="challengesSolutionsTips"
            rows={4}
            placeholder="What was hard? How did you solve it? Any advice for others?"
            defaultValue={p.challengesSolutionsTips || ""}
          />
        </label>

        <label>Hours Saved / Week<input type="number" name="hoursSavedPerWeek" min={0} defaultValue={p.hoursSavedPerWeek} /></label>

        <label>
          Deployment Date
          <input 
            type="date" 
            name="deploymentDate"
            defaultValue={p.deploymentDate ? new Date(p.deploymentDate).toISOString().split('T')[0] : ""}
          />
        </label>

        <label>
          Other Qualitative or Quantitative Impacts
          <textarea
            name="otherImpacts"
            rows={4}
            placeholder="e.g., quality improvements, NPS, CSAT, fewer escalations, speedups, accuracy deltas, etc."
            defaultValue={p.otherImpacts || ""}
          />
        </label>

        <label>
          Next Steps / Future Enhancements
          <textarea
            name="nextSteps"
            rows={4}
            placeholder="What improvements or additional features are planned? What would you like to build next?"
            defaultValue={p.nextSteps || ""}
          />
        </label>

        {/* Team picklist */}
        <label>
          Team
          <select name="team" defaultValue={p.team} required>
            <option value="">Select a team</option>
            <option value="Fraud">Fraud</option>
            <option value="Implementation">Implementation</option>
            <option value="Ops Data">Ops Data</option>
            <option value="Receipt Quality">Receipt Quality</option>
            <option value="Support">Support</option>
          </select>
        </label>

        <label>Owner<input name="owner" defaultValue={p.owner} required /></label>

        {/* Links (prefill up to 3) */}
        <fieldset className="card" style={{ padding: 12 }}>
          <legend className="text-sm" style={{ padding: "0 6px" }}>Links</legend>
          {[1,2,3].map((i) => {
            const L = i===1?link1:i===2?link2:link3;
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
                {g.items.map((name) => (
                  <label key={name} className="flex items-center gap-2">
                    <input type="checkbox" name="toolNames" value={name} defaultChecked={current.has(name)} /> {name}
                  </label>
                ))}
              </div>
            </fieldset>
          ))}

          {/* Single Other field for all categories */}
          <fieldset className="card" style={{ padding: 12 }}>
            <legend className="text-sm" style={{ padding: "0 6px" }}>Other Tools</legend>
            <label>
              Other tools not listed above (comma-separated)
              <input name="other_tools" placeholder="e.g., Cohere, Supabase Functions, Custom API" defaultValue={otherTools} />
            </label>
          </fieldset>
        </div>

        <div style={{ display: "flex", gap: 8 }}>
          <button type="submit">Save changes</button>
          <Link href={`/projects/${p.id}`} className="text-blue-700" style={{ alignSelf: "center" }}>Cancel</Link>
        </div>
      </form>
    </div>
  );
}
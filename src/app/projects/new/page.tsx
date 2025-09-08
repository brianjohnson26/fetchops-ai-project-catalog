import React from "react";

/** Canonical tool groups (v1) with free-text “Other” per group */
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

export default function NewProject() {
  return (
    <div className="grid">
      <h1 className="text-xl font-semibold">Add Project</h1>

      <form method="POST" action="/projects/new/submit" className="card grid" style={{ gridTemplateColumns: "1fr" }}>
        {/* Admin & basics */}
        <label>Title<input name="title" placeholder="e.g., Automatic Ticket Triage" required /></label>
        <label>Description<textarea name="description" rows={5} placeholder="What it does, who uses it, benefits" required /></label>

        {/* NEW FIELDS */}
        <label>
          How You Built It
          <textarea
            name="howYouBuiltIt"
            rows={4}
            placeholder="Workflow summary and/or diagram notes"
          />
        </label>

        <label>
          Challenges / Solutions / Tips
          <textarea
            name="challengesSolutionsTips"
            rows={4}
            placeholder="What was hard? How did you solve it? Any advice for others?"
          />
        </label>

        <label>Hours Saved / Week<input type="number" name="hoursSavedPerWeek" min={0} defaultValue={0} /></label>

        <label>
          Deployment Date
          <input 
            type="date" 
            name="deploymentDate"
            placeholder="When was this project deployed/launched?"
          />
        </label>

        <label>
          Other Qualitative or Quantitative Impacts
          <textarea
            name="otherImpacts"
            rows={4}
            placeholder="e.g., quality improvements, NPS, CSAT, fewer escalations, speedups, accuracy deltas, etc."
          />
        </label>

        <label>
          Next Steps / Future Enhancements
          <textarea
            name="nextSteps"
            rows={4}
            placeholder="What improvements or additional features are planned? What would you like to build next?"
          />
        </label>

        {/* Team as picklist */}
        <label>
          Team
          <select name="team" required>
            <option value="">Select a team</option>
            <option value="Fraud">Fraud</option>
            <option value="Implementation">Implementation</option>
            <option value="Receipt Quality">Receipt Quality</option>
            <option value="Support">Support</option>
          </select>
        </label>

        <label>Owner<input name="owner" placeholder="Full name" required /></label>

        {/* Links (optional, up to 3) */}
        <fieldset className="card" style={{ padding: 12 }}>
          <legend className="text-sm" style={{ padding: "0 6px" }}>Links - Include a demo, a link to the app/tool, and any other URLs relevant to the project</legend>

          {[1, 2, 3].map((i) => (
            <div key={i} className="grid" style={{ gridTemplateColumns: "200px 1fr", gap: 12, alignItems: "end", marginTop: i === 1 ? 0 : 8 }}>
              <label>
                Type
                <select name={`link_type_${i}`}>
                  <option value="Tool/Homepage">Tool/Homepage</option>
                  <option value="Demo">Demo</option>
                  <option value="Jira">Jira</option>
                  <option value="Other">Other</option>
                </select>
              </label>
              <label>
                URL
                <input name={`link_url_${i}`} placeholder="https://…" />
              </label>
            </div>
          ))}
          <div className="small mt-2">Leave any row blank if you don't need it.</div>
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
                    <input type="checkbox" name="toolNames" value={name} /> {name}
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
              <input name="other_tools" placeholder="e.g., Cohere, Supabase Functions, Custom API" />
            </label>
          </fieldset>
        </div>

        <button className="add-cta" type="submit">Create</button>
      </form>
    </div>
  );
}
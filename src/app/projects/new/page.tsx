'use client';

import * as React from 'react';
import { TEAMS } from "@/lib/constants";

/** Canonical tool groups (v1) with free-text "Other" per group */
const GROUPS: { key: string; label: string; items: string[] }[] = [
  {
    key: 'llms',
    label: 'LLMs / Chatbots',
    items: ['ChatGPT (OpenAI)', 'Claude (Anthropic)', 'Comet (Perplexity)', 'CustomGPT', 'Gemini (Google)'],
  },
  {
    key: 'fetch',
    label: 'Fetch Tools',
    items: [
      'Fetch Backend APIs',
      'FetchGPT',
      'FOCR Dash',
      'Fraudal',
      'MC Businesses',
      'MC Catalog',
      'MC Launch Pad',
      'Orbit',
      'PAM Dash',
      'RAD',
      'Receipt Manager',
      'Retailer Admin',
      'Supportal',
      'ZAF',
    ],
  },
  {
    key: 'apps',
    label: 'Core 3P Platforms / Integrations',
    items: [
      'Agent Assist (Forethought)',
      'Confluence',
      'Google Docs',
      'Google Drive',
      'Google Sheets',
      'Google Slides',
      'Jira',
      'Kount',
      'Scout (Forethought)',
      'Slack',
      'Zendesk',
    ],
  },
  {
    key: 'data',
    label: 'Data',
    items: ['Airtable', 'Grafana', 'Hex', 'Snowflake', 'Supabase', 'Tableau', 'Unblocked'],
  },
  {
    key: 'automation',
    label: 'AI / Automation / Coding & Dev Frameworks',
    items: [
      'Bitbucket',
      'ChatGPT Agent',
      'Chrome Extension',
      'Cursor',
      'Express',
      'Gamma',
      'Github',
      'Google Apps Script',
      'Loveable',
      'n8n',
      'Node.JS',
      'NotebookLM',
      'Open AI API',
      'Playwright',
      'Python',
      'Replit',
      'Slackbots / API',
      'Streamlit',
      'VS Code',
      'Zapier',
      'Zendesk API / Macros',
    ],
  },
];

const DESC_MAX = 300;

export default function NewProject() {
  const [desc, setDesc] = React.useState<string>('');
  const remaining = DESC_MAX - desc.length;

  return (
    <div className="grid">
      <h1 className="text-xl font-semibold">Add Project</h1>

      <div className="card" style={{ backgroundColor: '#f8f9fa', border: '1px solid #e9ecef', padding: '16px', marginBottom: '16px' }}>
        <p className="text-sm" style={{ margin: 0, lineHeight: '1.5' }}>
          <strong>Note:</strong> The catalog is intended for AI and automation projects that have been successfully implemented and have ongoing impact across our teams. While we love all AI innovation, please refrain from entering experiments, one-off projects, or projects that only impact a single individual's personal workload.
        </p>
      </div>

      <form
        method="POST"
        action="/projects/new/submit"
        className="card grid"
        style={{ gridTemplateColumns: '1fr' }}
      >
        {/* Admin & basics */}
        <label>
          Title
          <input name="title" placeholder="e.g., Automatic Ticket Triage" required />
        </label>

        {/* Team as picklist */}
        <label>
          Team
          <select name="team" required>
            <option value="">Select a team</option>
            {TEAMS.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </label>

        <label>
          Owner (single person only)
          <input name="owner" placeholder="Full name" required />
        </label>

        <label>
          Deployment Date
          <input
            type="date"
            name="deploymentDate"
            placeholder="When was this project deployed/launched?"
          />
        </label>

        <label htmlFor="description">Description</label>
        <textarea
          id="description"
          name="description"
          rows={5}
          placeholder="What it does, who uses it, benefits (max 300 characters)"
          maxLength={DESC_MAX}
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
          required
        />
        <div className="small mt-1" aria-live="polite">
          {remaining} characters left
        </div>

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

        <label>
          Hours Saved / Week
          <input type="number" name="hoursSavedPerWeek" min={0} defaultValue={0} />
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

        <label>
          Other Notes
          <textarea
            name="otherNotes"
            rows={4}
            placeholder="Additional owners, project inspiration, or any other notes you'd like to add"
          />
        </label>

        {/* Links (optional, up to 3) */}
        <fieldset className="card" style={{ padding: 12 }}>
          <legend className="text-sm" style={{ padding: '0 6px' }}>
            Links - Include a demo, a link to the app/tool, and any other URLs relevant to the project
          </legend>

          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="grid"
              style={{
                gridTemplateColumns: '200px 1fr',
                gap: 12,
                alignItems: 'end',
                marginTop: i === 1 ? 0 : 8,
              }}
            >
              <label>
                Type
                <select name={`link_type_${i}`}>
                  <option value="">Select</option>
                  <option value="Tool/Homepage">Tool / Homepage</option>
                  <option value="Demo">Demo</option>
                  <option value="Jira">Jira</option>
                  <option value="Other">Other</option>
                </select>
              </label>
              <label>
                URL
                <input name={`link_url_${i}`} placeholder="https://example.com" />
              </label>
            </div>
          ))}
          <div className="small mt-2">Leave any row blank if you don't need it.</div>
        </fieldset>

        {/* Grouped tools */}
        <div className="grid" style={{ gridTemplateColumns: '1fr' }}>
          <h2 className="font-semibold">Tools Used</h2>

          {GROUPS.map((g) => (
            <fieldset key={g.key} className="card" style={{ padding: 12 }}>
              <legend className="text-sm" style={{ padding: '0 6px' }}>
                {g.label}
              </legend>
              <div className="grid" style={{ gridTemplateColumns: 'repeat(3, minmax(0, 1fr))' }}>
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
            <legend className="text-sm" style={{ padding: '0 6px' }}>Other Tools</legend>
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
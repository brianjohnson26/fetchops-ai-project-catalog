// src/components/BrowseFilters.tsx
"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { TEAMS } from "@/lib/constants";

export type Project = {
  id: string;
  title: string;
  summary?: string | null;
  team?: string | null;
  owner?: string | null;
  deploymentDate?: string | null;
  tools: { tool: { name: string } }[];
};

type Props = {
  projects: Project[];
  allTeams: string[];  // kept for backward-compat; we merge with TEAMS
  allOwners: string[];
  allTools: string[];
};

export default function BrowseFilters({ projects, allTeams, allOwners, allTools }: Props) {
  const [keyword, setKeyword] = useState("");
  const [team, setTeam] = useState<string>("__ALL__");
  const [owner, setOwner] = useState<string>("__ALL__");
  const [toolFilter, setToolFilter] = useState<Record<string, boolean>>({});
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  // Ensure teams are always in sync with the canonical TEAMS list.
  const teamOptions = useMemo(() => {
    return Array.from(new Set<string>([...TEAMS, ...allTeams])).sort((a, b) => a.localeCompare(b));
  }, [allTeams]);

  // Defensive sorting for owners/tools (in case upstream isn't sorted)
  const ownerOptions = useMemo(() => {
    return Array.from(new Set(allOwners)).sort((a, b) => a.localeCompare(b));
  }, [allOwners]);

  const toolOptions = useMemo(() => {
    return Array.from(new Set(allTools)).sort((a, b) => a.localeCompare(b));
  }, [allTools]);

  const filtered = useMemo(() => {
    const kw = keyword.trim().toLowerCase();
    return projects.filter((p) => {
      if (team !== "__ALL__" && (p.team ?? "") !== team) return false;
      if (owner !== "__ALL__" && (p.owner ?? "") !== owner) return false;

      // tools filter (if any tool is ticked, require at least one match)
      const activeTools = Object.keys(toolFilter).filter((k) => toolFilter[k]);
      if (activeTools.length > 0) {
        const projectToolNames = new Set(p.tools.map((t) => t.tool.name));
        const hasAny = activeTools.some((t) => projectToolNames.has(t));
        if (!hasAny) return false;
      }

      // date range filter
      if (dateFrom || dateTo) {
        if (!p.deploymentDate) return false; // exclude projects without deployment date
        const deploymentDate = new Date(p.deploymentDate);
        if (dateFrom && deploymentDate < new Date(dateFrom)) return false;
        if (dateTo && deploymentDate > new Date(dateTo)) return false;
      }

      if (!kw) return true;
      const hay =
        `${p.title ?? ""} ${p.summary ?? ""} ${p.team ?? ""} ${p.owner ?? ""} ${p.tools
          .map((t) => t.tool.name)
          .join(" ")}`.toLowerCase();
      return hay.includes(kw);
    });
  }, [projects, keyword, team, owner, toolFilter, dateFrom, dateTo]);

  const count = filtered.length;

  return (
    <div className="mx-auto max-w-5xl">
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        {/* Header with title */}
        <div className="mb-6">
          <h1 className="text-3xl font-semibold text-black">Browse AI Projects</h1>
          <p className="mt-2 text-gray-600">
            Filter by keyword, team, owner, tools, and deployment date.
          </p>
        </div>

        {/* Keyword filter */}
        <div className="mb-4">
          <label className="mb-2 block text-sm font-medium text-black">Keyword</label>
          <input
            type="text"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="Type to search projects (real-time filtering)..."
            className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        {/* Filters row - horizontal layout with explicit styles */}
        <div style={{ display: 'flex', gap: '24px', marginBottom: '24px' }}>
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500', color: 'black' }}>Team</label>
            <select
              value={team}
              onChange={(e) => setTeam(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                backgroundColor: 'white',
                fontSize: '14px'
              }}
            >
              <option value="__ALL__">All teams</option>
              {teamOptions.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500', color: 'black' }}>Owner</label>
            <select
              value={owner}
              onChange={(e) => setOwner(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                backgroundColor: 'white',
                fontSize: '14px'
              }}
            >
              <option value="__ALL__">All owners</option>
              {ownerOptions.map((o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </select>
          </div>

          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500', color: 'black' }}>Tools</label>
            <select
              value={Object.keys(toolFilter).find((k) => toolFilter[k]) || "__ALL__"}
              onChange={(e) => {
                if (e.target.value === "__ALL__") {
                  setToolFilter({});
                } else {
                  setToolFilter({ [e.target.value]: true });
                }
              }}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                backgroundColor: 'white',
                fontSize: '14px'
              }}
            >
              <option value="__ALL__">All tools</option>
              {toolOptions.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Date range filters */}
        <div style={{ display: 'flex', gap: '24px', marginBottom: '24px' }}>
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500', color: 'black' }}>Deployment Date From</label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                backgroundColor: 'white',
                fontSize: '14px'
              }}
            />
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500', color: 'black' }}>Deployment Date To</label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                backgroundColor: 'white',
                fontSize: '14px'
              }}
            />
          </div>
          <div style={{ flex: 1 }}>
            {/* spacer for alignment */}
          </div>
        </div>

        {/* Results with Export CSV button */}
        <div style={{ 
          marginTop: '24px', 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          width: '100%'
        }}>
          <div style={{ fontSize: '14px', color: 'black' }}>
            Showing {count} project{count === 1 ? "" : "s"}
          </div>
          <a
            href="/api/projects-csv"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              padding: '8px 16px',
              backgroundColor: '#6d28d9',
              color: 'white',
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: '600',
              textDecoration: 'none',
              transition: 'background-color 0.15s ease',
              whiteSpace: 'nowrap',
              marginLeft: 'auto'
            }}
            onMouseEnter={(e) => (e.target as HTMLElement).style.backgroundColor = '#300d38'}
            onMouseLeave={(e) => (e.target as HTMLElement).style.backgroundColor = '#6d28d9'}
          >
            Export CSV
          </a>
        </div>

        <ul className="mt-2 space-y-6">
          {filtered.map((p) => (
            <li key={p.id} className="list-disc pl-4">
              <h3 className="text-base font-medium text-black">
                <Link
                  href={`/projects/${p.id}`}
                  className="text-black hover:text-purple-600 hover:underline"
                >
                  {p.title}
                </Link>
              </h3>

              {p.summary ? (
                <div 
                  className="mt-3 max-w-3xl text-sm leading-6 text-black" 
                  style={{ 
                    whiteSpace: 'pre-line',
                    wordWrap: 'break-word',
                    overflowWrap: 'break-word'
                  }}
                >
                  {p.summary}
                </div>
              ) : null}

              <div style={{ marginTop: '24px', fontSize: '14px', color: 'black' }}>
                {p.team ? <div style={{ marginBottom: '4px' }}>Team: {p.team}</div> : null}
                {p.owner ? <div style={{ marginBottom: '4px' }}>Owner: {p.owner}</div> : null}
                {p.deploymentDate ? (
                  <div style={{ marginBottom: '4px' }}>
                    Deployed: {new Date(p.deploymentDate).toLocaleDateString()}
                  </div>
                ) : null}
                {p.tools.length > 0 ? (
                  <div>
                    Tools: {p.tools.map((t) => t.tool.name).join(" · ")}
                  </div>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

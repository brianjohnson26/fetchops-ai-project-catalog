'use client';

import React, { useMemo, useState } from 'react';

type MaybeStr = string | null | undefined;
type MaybeTools = string[] | string | null | undefined;

export type Project = {
  id: string;
  title: string;
  summary?: MaybeStr;
  team?: MaybeStr;
  owner?: MaybeStr; // name or Slack handle
  tools?: MaybeTools; // string[] or comma-separated string
};

function toList(val: MaybeTools): string[] {
  if (!val) return [];
  if (Array.isArray(val)) {
    return val.map((t) => String(t).trim()).filter(Boolean);
  }
  return String(val)
    .split(/[,/|]/g)
    .map((t) => t.trim())
    .filter(Boolean);
}

function normalize(s: MaybeStr): string {
  return (s ?? '').toLowerCase();
}

export default function BrowseFilters({ projects }: { projects: Project[] }) {
  const [keyword, setKeyword] = useState('');
  const [team, setTeam] = useState<string>('all');
  const [owner, setOwner] = useState<string>('all');
  const [selectedTools, setSelectedTools] = useState<Set<string>>(new Set());

  // Build option lists
  const { teams, owners, tools } = useMemo(() => {
    const tset = new Set<string>();
    const oset = new Set<string>();
    const toolset = new Set<string>();

    for (const p of projects) {
      const t = (p.team ?? '').trim();
      if (t) tset.add(t);

      const o = (p.owner ?? '').trim();
      if (o) oset.add(o);

      for (const tool of toList(p.tools)) {
        if (tool) toolset.add(tool);
      }
    }

    return {
      teams: Array.from(tset).sort((a, b) => a.localeCompare(b)),
      owners: Array.from(oset).sort((a, b) => a.localeCompare(b)),
      tools: Array.from(toolset).sort((a, b) => a.localeCompare(b)),
    };
  }, [projects]);

  const filtered = useMemo(() => {
    const kw = normalize(keyword);

    return projects.filter((p) => {
      if (kw) {
        const haystack = [
          p.title,
          p.summary,
          p.owner,
          toList(p.tools).join(' '),
        ]
          .map(normalize)
          .join(' ');
        if (!haystack.includes(kw)) return false;
      }

      if (team !== 'all') {
        const pTeam = normalize(p.team);
        if (pTeam !== normalize(team)) return false;
      }

      if (owner !== 'all') {
        const pOwner = normalize(p.owner);
        if (pOwner !== normalize(owner)) return false;
      }

      if (selectedTools.size > 0) {
        const pt = new Set(toList(p.tools).map((t) => normalize(t)));
        let hasAny = false;
        for (const sel of selectedTools) {
          if (pt.has(normalize(sel))) {
            hasAny = true;
            break;
          }
        }
        if (!hasAny) return false;
      }

      return true;
    });
  }, [projects, keyword, team, owner, selectedTools]);

  function toggleTool(tool: string) {
    setSelectedTools((prev) => {
      const next = new Set(prev);
      if (next.has(tool)) next.delete(tool);
      else next.add(tool);
      return next;
    });
  }

  function clearAll() {
    setKeyword('');
    setTeam('all');
    setOwner('all');
    setSelectedTools(new Set());
  }

  const selectedToolsCount = selectedTools.size;

  return (
    <div className="flex flex-col gap-4">
      {/* Top control bar: single row on md+; wraps on small screens */}
      <div className="w-full flex flex-col md:flex-row md:items-center md:gap-4 gap-2">
      {/* Keyword (flex-grow) */}
        <div className="flex-1">
          <label className="sr-only">Keyword</label>
          <input
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="🔍 Type to search projects (real-time filtering)..."
            className="w-full rounded-xl border p-2"
          />
        </div>

        {/* Team */}
        <div className="min-w-40">
          <label className="sr-only">Team</label>
          <select
            value={team}
            onChange={(e) => setTeam(e.target.value)}
            className="w-full rounded-xl border p-2"
            aria-label="Filter by team"
          >
            <option value="all">All teams</option>
            {teams.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>

        {/* Owner */}
        <div className="min-w-40">
          <label className="sr-only">Owner</label>
          <select
            value={owner}
            onChange={(e) => setOwner(e.target.value)}
            className="w-full rounded-xl border p-2"
            aria-label="Filter by owner"
          >
            <option value="all">All owners</option>
            {owners.map((o) => (
              <option key={o} value={o}>
                {o}
              </option>
            ))}
          </select>
        </div>

        {/* Tools dropdown */}
        <div className="relative">
          <details className="group">
            <summary
              className="list-none select-none rounded-xl border p-2 cursor-pointer md:min-w-40"
              aria-label="Filter by tools"
            >
              Tools{selectedToolsCount ? ` (${selectedToolsCount})` : ''}
            </summary>
            <div
              className="absolute z-10 mt-2 w-72 max-h-72 overflow-auto rounded-xl border bg-white p-3 shadow"
              role="menu"
              aria-label="Tools menu"
            >
              {tools.length === 0 ? (
                <div className="text-sm text-gray-500 p-2">
                  No tools found in projects.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {tools.map((tool) => {
                    const checked = selectedTools.has(tool);
                    return (
                      <label
                        key={tool}
                        className="flex items-center gap-2 text-sm cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleTool(tool)}
                        />
                        <span>{tool}</span>
                      </label>
                    );
                  })}
                </div>
              )}

              <div className="mt-3 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setSelectedTools(new Set())}
                  className="text-sm underline"
                >
                  Clear tools
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    // close <details>
                    const el = (e.target as HTMLElement).closest('details') as HTMLDetailsElement | null;
                    if (el) el.open = false;
                  }}
                  className="rounded-lg border px-3 py-1 text-sm"
                >
                  Done
                </button>
              </div>
            </div>
          </details>
        </div>

        {/* Clear all */}
        <div>
          <button
            onClick={clearAll}
            className="rounded-xl border px-3 py-2 hover:bg-gray-50 w-full md:w-auto"
            type="button"
          >
            Clear all
          </button>
        </div>
      </div>

      {/* Count and filter status */}
      <div className="flex items-center gap-4 text-sm text-gray-600">
        <span>
          Showing <strong>{filtered.length}</strong> of {projects.length} projects
        </span>
        {(keyword || team !== 'all' || owner !== 'all' || selectedTools.size > 0) && (
          <span className="text-blue-600 font-medium">
            🔍 Filters active - results update automatically
          </span>
        )}
      </div>

      {/* Results */}
      <ul className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((p) => {
          const pt = toList(p.tools);
          return (
            <li key={p.id} className="border-2 border-gray-400 rounded-2xl p-4 shadow-md bg-white">
              <div className="flex justify-between items-start mb-1">
                <div className="text-lg font-semibold">{p.title}</div>
                <div className="flex gap-4">
                  <a 
                    href={`/projects/${p.id}`} 
                    className="px-3 py-1 bg-purple-600 text-white rounded text-sm font-medium hover:bg-purple-700 transition-colors"
                  >
                    View
                  </a>
                  <a 
                    href={`/projects/${p.id}/edit`} 
                    className="px-3 py-1 bg-purple-600 text-white rounded text-sm font-medium hover:bg-purple-700 transition-colors"
                  >
                    Edit
                  </a>
                </div>
              </div>
              {p.summary ? (
                <p className="text-sm text-gray-700 mb-3 line-clamp-3">{p.summary}</p>
              ) : null}
              <div className="flex flex-wrap gap-2 text-xs text-gray-600 mb-2">
                {p.team ? <span className="px-2 py-1 border rounded-full">Team: {p.team}</span> : null}
                {p.owner ? <span className="px-2 py-1 border rounded-full">Owner: {p.owner}</span> : null}
              </div>
              {pt.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {pt.map((t) => (
                    <span key={t} className="text-xs px-2 py-1 border rounded-full">
                      {t}
                    </span>
                  ))}
                </div>
              ) : null}
            </li>
          );
        })}
      </ul>

      {filtered.length === 0 && (
        <div className="text-sm text-gray-600">
          No projects match the current filters.
        </div>
      )}
    </div>
  );
}

// src/components/BrowseFilters.tsx
"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

export type Project = {
  id: string;
  title: string;
  summary?: string | null;
  team?: string | null;
  owner?: string | null;
  tools: { tool: { name: string } }[];
};

type Props = {
  projects: Project[];
  allTeams: string[];
  allOwners: string[];
  allTools: string[];
};

export default function BrowseFilters({ projects, allTeams, allOwners, allTools }: Props) {
  const [keyword, setKeyword] = useState("");
  const [team, setTeam] = useState<string>("__ALL__");
  const [owner, setOwner] = useState<string>("__ALL__");
  const [toolFilter, setToolFilter] = useState<Record<string, boolean>>({});

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

      if (!kw) return true;
      const hay =
        `${p.title ?? ""} ${p.summary ?? ""} ${p.team ?? ""} ${p.owner ?? ""} ${p.tools
          .map((t) => t.tool.name)
          .join(" ")}`.toLowerCase();
      return hay.includes(kw);
    });
  }, [projects, keyword, team, owner, toolFilter]);

  const count = filtered.length;

  return (
    <div className="mx-auto max-w-5xl">
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-semibold text-black">Browse AI Projects</h1>
        <p className="mt-1 text-sm text-black">
          Filter by keyword, team, owner, and tools.
        </p>

        <div className="mt-4">
          <a
            href="/api/projects-csv"
            className="inline-flex items-center rounded-md bg-purple-600 px-3 py-2 text-sm font-semibold text-white hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            Export CSV
          </a>
        </div>

        {/* Filters */}
        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="col-span-1 md:col-span-3">
            <label className="mb-1 block text-sm font-medium text-black">Keyword</label>
            <div className="relative">
              <input
                type="text"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="Type to search projects (real-time filtering)…"
                className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm placeholder:text-gray-400 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-black">Team</label>
            <select
              value={team}
              onChange={(e) => setTeam(e.target.value)}
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="__ALL__">All teams</option>
              {allTeams.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-black">Owner</label>
            <select
              value={owner}
              onChange={(e) => setOwner(e.target.value)}
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="__ALL__">All owners</option>
              {allOwners.map((o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-3">
            <details className="rounded-md border border-gray-200 bg-gray-50 p-3">
              <summary className="cursor-pointer select-none text-sm font-medium text-black">
                Tools
              </summary>
              <div className="mt-3 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => setToolFilter({})}
                  className="rounded-md bg-purple-100 px-2.5 py-1 text-xs font-medium text-purple-700 hover:bg-purple-200"
                >
                  Clear all
                </button>
                {allTools.map((t) => {
                  const checked = !!toolFilter[t];
                  return (
                    <label key={t} className="flex items-center gap-2 text-sm text-black">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={(e) =>
                          setToolFilter((prev) => ({ ...prev, [t]: e.target.checked }))
                        }
                        className="h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                      />
                      <span>{t}</span>
                    </label>
                  );
                })}
              </div>
            </details>
          </div>
        </div>

        {/* Results */}
        <div className="mt-6 text-sm text-black">Showing {count} project{count === 1 ? "" : "s"}</div>

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
                <div className="mt-3 max-w-3xl text-sm leading-6 text-black whitespace-pre-line">{p.summary}</div>
              ) : null}

              <div className="mt-3 text-sm text-black">
                {p.team ? <span className="mr-4">Team: {p.team}</span> : null}
                {p.owner ? <span className="mr-4">Owner: {p.owner}</span> : null}
                {p.tools.length > 0 ? (
                  <span>
                    {p.tools.map((t) => t.tool.name).join(" · ")}
                  </span>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

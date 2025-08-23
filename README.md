# Fetch AI Project Catalog (No-GitHub, Replit-first)

An internal catalog for implemented AI projects at Fetch: submit, browse, dashboard metrics, and "find an expert" by tool.

This bundle is optimized for **Replit** (one-click run) and uses **SQLite** via Prisma to avoid external setup. You can later switch to Postgres with the same schema.

## Features
- Dashboard: totals, weekly hours saved, top tools, latest projects
- Browse + detail pages
- Add Project (guarded by simple `ADMIN_KEY` in `.env`)
- Find an expert (by tool -> list Slack handles with project counts)
- Seed data for quick demo

## Quick start (Replit)
1. Create a Replit account → **Create Repl from ZIP** using this repo.
2. In the Replit **Shell**, run:
   ```bash
   pnpm i
   pnpm prisma:deploy
   pnpm seed
   pnpm dev
   ```
   (If you rely on `.replit`, Replit will run these automatically, but running them once manually ensures the DB is initialized.)
3. Add an `.env` file (copy `.env.example`) and set a strong `ADMIN_KEY`. Example:
   ```env
   DATABASE_URL="file:./dev.db"
   ADMIN_KEY="set-a-strong-secret"
   PORT=3000
   ```
4. Open the webview → you should see the dashboard. Go to **/projects/new** to add a project (you'll need the `ADMIN_KEY`).

## Maintenance model (no engineering required)
- If you need changes or bug fixes, tell ChatGPT what you want changed. I’ll ship you a new ZIP or a specific file patch.
- You can upload the replacement file(s) in Replit’s editor, or re-import a new ZIP and copy the `/prisma/dev.db` if you want to preserve data.
- For safe upgrades, export your data (Prisma can emit JSON; ask and I’ll provide a script).

## Tech
- Next.js 14 (App Router, TypeScript), Prisma 5, SQLite
- Minimal styling with CSS; accessible forms and semantic HTML
- No external auth; a simple `ADMIN_KEY` protects the write flow

## Data model
- **Project**: title, description, team, owner Slack handle, hoursSavedPerWeek, tools[], links[]
- **Tool**: name (unique)
- **Person**/**PersonProject**: reserved for future richer relationships (already used in seed for examples)
- **Link**: typed URLs to Jira/Drive/Slack/Other

## Switching to Postgres later
Change `DATABASE_URL` to a Postgres URL and run `pnpm prisma:deploy`. I can provide a migration and import/export scripts on request.

## Tests
A lightweight Vitest setup is included (you can expand as needed).

## Accessibility
- Labels tied to inputs
- Keyboard navigable
- High-contrast defaults

## Troubleshooting
- If you see a Prisma error about the client, run: `pnpm prisma:generate && pnpm prisma:deploy`.
- If the DB seems empty, re-run `pnpm seed`.
- On port issues, ensure `PORT=3000` in `.env`.

## Roadmap stubs
- Comments/Likes, Semantic search (“similar projects”), richer people-profiles, Slack/Jira/Drive live integrations.

# Release Runbook — Fetch AI Project Catalog

## Environment
- **DB (Supabase)**: use the **Session pooler** URL (host ends with `.pooler.supabase.com:5432`).
- Prisma datasource in `prisma/schema.prisma`:
  ```prisma
  datasource db {
    provider = "postgresql"
    url      = env("DATABASE_URL_SUPABASE")
  }

## Secrets

Set exactly **one** secret and use it for both deploys and local dev:

- `DATABASE_URL_SUPABASE` — Supabase **Session pooler** (Prisma) URL. Example:  postgresql://postgres.udgrmmvrpmlhnhywijvz:FLjRBB0h%40FIl2aM@aws-1-us-east-2.pooler.supabase.com
:5432/postgres?sslmode=require

- Passwords containing `@` must be encoded as `%40`
- Keep `?sslmode=require`
- Host must end with `.pooler.supabase.com:5432`

**Do not** set `DATABASE_URL` (leave it unset in `.env` and in deployment secrets).

Where to set:
- **Deployments → Add deployment secret**:  
`DATABASE_URL_SUPABASE=postgresql://...`
- **.env (local dev)**:  
`DATABASE_URL_SUPABASE=postgresql://...`

**Note:** For Prisma with Supabase Session Pooler, add `pgbouncer=true` to the DB URL to disable prepared statements. Improves stability under load/restarts. Safe to defer; add if you see P1001 / 53300 or connection resets.


## Deploy (Replit → Deployments)

- **Build**:  
  `npx --yes pnpm@9 install --prod=false && npx --yes pnpm@9 exec prisma generate && npx --yes pnpm@9 run build`

- **Run**:  
  `npm run start -- -p $PORT`

- **Notes**:
  - Do **not** use `corepack enable` or `npm ci` here.
  - Ensure **Production database settings (Helium)** is **off**.
  - Deployment secret **`DATABASE_URL_SUPABASE`** must be set (Session pooler URL).
  - After deploy, open `/api/status` and hard-refresh the app.

## Health

- **Endpoint**: `/api/status`
- **Expected JSON** when healthy:
  ```json
  {"ok": true, "db": "up", "projects": <number>}
- If not healthy:
   - Verify the DATABASE_URL_SUPABASE secret uses the Session pooler host (*.pooler.supabase.com:5432) and includes ?sslmode=require.
   - Confirm the route exists at src/app/api/status/route.ts and imports the shared Prisma client from src/lib/prisma.

## Schema changes (apply SQL in Supabase)

> You’ll generate a SQL file from your Prisma schema, run it in Supabase, then redeploy.

### A) First-time baseline (creates all tables)
1. In the Replit Shell:
   npx prisma migrate diff --from-empty --to-schema-datamodel prisma/schema.prisma --script > prisma/migrations/next.sql
2. Open Supabase → SQL → New query, paste the contents of prisma/migrations/next.sql, and Run.
3. Redeploy and verify /api/status returns ok: true

### B) Subsequent changes (diff from current DB)

1. Ensure your .env has: DATABASE_URL_SUPABASE="postgresql://...pooler.supabase.com:5432/postgres?sslmode=require"
2. In the Replit Shell:
 npx prisma migrate diff \
 --from-url "$DATABASE_URL_SUPABASE" \
 --to-schema-datamodel prisma/schema.prisma \
 --script > prisma/migrations/next.sql
3. Open Supabase → SQL → New query, paste prisma/migrations/next.sql, and Run.
4. Redeploy and verify /api/status.

Notes
- Keep the generated files under prisma/migrations/ (e.g., commit prisma/migrations/next.sql).
- If Supabase reports objects already exist, regenerate using B) Subsequent changes, not the baseline.
- Never run prisma migrate deploy from the deploy environment; apply SQL in Supabase instead.

## Common errors & fixes

- **“table public.Project (or Tool) does not exist”**
  - Cause: Tables not created in Supabase.
  - Fix:
    1) Generate SQL from Prisma:
       ```bash
       npx prisma migrate diff --from-empty --to-schema-datamodel prisma/schema.prisma --script > prisma/migrations/next.sql
       ```
    2) Open **Supabase → SQL → New query**, paste `prisma/migrations/next.sql`, **Run**.
    3) Redeploy and check `/api/status`.

- **“FATAL: Tenant or user not found”** or **“invalid domain character in database URL”**
  - Cause: Using the wrong connection style for the pooler, or malformed URL.
  - Fix (Session pooler):
    - Use the **Session pooler** host: `*.pooler.supabase.com:5432`
    - Example (encode `@` as `%40` and keep SSL):
      ```
      postgresql://postgres.udgrmmvrpmlhnhywijvz:FLjRBB0h%40FIl2aM@aws-1-us-east-2.pooler.supabase.com:5432/postgres?sslmode=require
      ```
    - Ensure you copied the **Prisma** URL from **Supabase → Database → Connect → Session pooler → ORMs → Prisma**.

- **Prisma P1001: “Can’t reach database server …”**
  - Causes:
    - Using the **direct** host (`db.<project>.supabase.co`) when egress is blocked, or wrong port.
    - Helium (Replit managed DB) interfering.
  - Fix:
    - Use the **Session pooler** host with port **5432** and `?sslmode=require`.
    - Disable **Production database settings (Helium)** in Replit Deploy.
    - Verify the app is reading the right env var (see next item).

- **App still hitting old URL (e.g., `db.<project>.supabase.co:6543`)**
  - Causes:
    - Stale `DATABASE_URL` in repo `.env`.
    - Deployment secret name mismatch.
  - Fix:
    - Remove any `DATABASE_URL=` from `.env` and from Deployment secrets.
    - In `prisma/schema.prisma`, ensure:
      ```prisma
      datasource db {
        provider = "postgresql"
        url      = env("DATABASE_URL_SUPABASE")
      }
      ```
    - Set **one** secret only: `DATABASE_URL_SUPABASE=postgresql://...pooler.supabase.com:5432/postgres?sslmode=require`

- **Passwords with `@` break the URL**
  - Fix: URL-encode `@` as `%40` in the password portion of the connection string.

- **Build fails with Corepack/PNPM errors**
  - Fix (Replit Deploy → Build command):
    ```
    npx --yes pnpm@9 install --prod=false && npx --yes pnpm@9 exec prisma generate && npx --yes pnpm@9 run build
    ```
  - Don’t run `corepack enable`. Keep **Run** as:
    ```
    npm run start -- -p $PORT
    ```

- **Next.js loads but dashboard shows no data**
  - Fix: Insert a quick test row in Supabase:
    ```sql
    INSERT INTO "Tool" ("name") VALUES ('ChatGPT (OpenAI)');
    INSERT INTO "Project" ("title","description","team","slackHandle","hoursSavedPerWeek","createdAt","updatedAt")
    VALUES ('Sample AI Project','Seed row','Support','@you',1,now(),now());
    ```
  - Hard-refresh, or visit `/api/status` to confirm `projects` count.

- **Health check not found**
  - Ensure file exists at `src/app/api/status/route.ts` and imports the shared Prisma client:
    ```ts
    import { prisma } from '../../../lib/prisma';
    ```
  - Expected JSON at `/api/status`:
    ```json
    {"ok": true, "db": "up", "projects": <number>}
    ```

## Quick checklist before each release

- [ ] **Secret set:** `DATABASE_URL_SUPABASE` exists (deployment secret) and points to the **Session pooler** host  
      `*.pooler.supabase.com:5432` and ends with `?sslmode=require`.
- [ ] **Prisma datasource:** `prisma/schema.prisma` uses  
      ```prisma
      datasource db {
        provider = "postgresql"
        url      = env("DATABASE_URL_SUPABASE")
      }
      ```
- [ ] **No Helium:** Replit “Production database settings” is **disabled**.
- [ ] **No override:** Repo `.env` contains **only** `DATABASE_URL_SUPABASE=...` (no `DATABASE_URL=` anywhere).
- [ ] **Build command (Deployments):**  
      `npx --yes pnpm@9 install --prod=false && npx --yes pnpm@9 exec prisma generate && npx --yes pnpm@9 run build`
- [ ] **Run command (Deployments):**  
      `npm run start -- -p $PORT`
- [ ] **Schema applied:** If you changed the schema, generated SQL was run in **Supabase → SQL**.
- [ ] **Health check:** `/api/status` returns `{"ok": true, "db": "up", "projects": <number>}`.
- [ ] **Smoke test:** Log in → **Add Project** → hard-refresh dashboard and confirm counts update.
- [ ] **Logs clean:** Deployments → Logs show no Prisma connection errors.

### Manual DB export (ad-hoc)
- Supabase → SQL → “New query”:
  ```sql
  -- quick snapshot of key tables
  COPY "Project" TO STDOUT WITH CSV HEADER;

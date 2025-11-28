Purpose
Provide concise, actionable guidance so an AI coding agent can be immediately productive in this repo.

Essentials (big picture)
- Architecture: full-stack TypeScript app with a React + Vite client in `client/` and an Express + tRPC backend in `server/`.
- Agents: multi-agent logic lives under `server/agents/` (see `base.ts`, `orchestrator.ts`, `supervisor.ts`, `ingestion.ts`, `analysis.ts`, `synthesis.ts`). The Supervisor orchestrates Ingestion → Analysis → Synthesis flows.
- Entry points: backend entry is `server/_core/index.ts` (dev uses `tsx watch` and bundles with `esbuild` for production). Frontend is Vite under `client/` and integrated into the same dev server via `server/_core/vite.ts`.

How to run / developer workflows (explicit)
- Install: `pnpm install` (this repo uses pnpm). Patched dependency: `patches/wouter@3.7.1.patch` is applied via `pnpm` config.
- Dev: `pnpm dev` — runs `NODE_ENV=development tsx watch server/_core/index.ts`. This starts the tRPC/Express server and Vite dev middleware.
- Build: `pnpm build` — runs `vite build` and bundles `server/_core/index.ts` with `esbuild` into `dist/`.
- Start production bundle: `pnpm start` (node dist/index.js)
- DB: `pnpm db:push` runs drizzle-kit generate and migrations (database schema in `drizzle/schema.ts`).
- Tests: `pnpm test` (vitest). Typecheck: `pnpm check`. Format: `pnpm format`.

Key conventions & patterns (project-specific)
- API prefix: all APIs should be registered under `/api/` (see comment in `server/routers.ts`). tRPC middleware mounts at `/api/trpc` in `server/_core/index.ts`.
- Large uploads: server body parsers are configured to `50mb` in `server/_core/index.ts` — watch for that when changing upload logic.
- Session & cookies: session cookie name and helpers live in `shared/const.ts` and `server/_core/cookies.ts` — use these for auth-related work.
- Agents pattern: each agent extends `server/agents/base.ts`; orchestration logic is centralized in `server/agents/orchestrator.ts` and `supervisor.ts` — prefer adding new agent behavior by extending these patterns.
- Long-running workflows: agent executions are persisted (see `server/db.ts` and drizzle schema snapshots); favors idempotent, resumable operations.

Integration points & important files to inspect
- Backend entry: `server/_core/index.ts` (port selection, vite integration, tRPC mount)
- Router registration: `server/routers.ts` and `server/routers/acpa.ts` (tRPC procedures like `acpa.analyzePolicy`)
- Agents: `server/agents/*` (base, orchestrator, supervisor, ingestion, analysis, synthesis)
- DB & migrations: `drizzle/schema.ts`, `drizzle/migrations/`, and `pnpm db:push` script
- Frontend hooks and TRPC client: `client/src/_core/hooks/useAuth.ts`, `client/src/lib/trpc.ts`, `client/src/pages/ACPAAnalysis.tsx`

Notes about code-style, build and gotchas
- Node/Esm: project uses ESM (`type: module`) and esbuild to bundle server code — avoid CommonJS-only patterns when editing server entry code.
- Environment: `.env` is read via `dotenv` in `server/_core/index.ts`; many features rely on env vars (DB URL, JWT secrets, cloud keys). Do not hardcode secrets.
- Port handling: dev server probes a range starting at `process.env.PORT || 3000` and will fall back to a nearby free port — tests or automation that expect a fixed port should account for this.
- Frontend server integration: in development the backend mounts Vite (so client URLs are served by the same process), but production serves static files (see `serveStatic` in `server/_core/vite.ts`).

Quick examples (where to change behavior)
- Add a tRPC procedure: edit `server/routers/acpa.ts`, then register in `server/routers.ts` via `appRouter`.
- Add an agent: create `server/agents/myAgent.ts` extending `base.ts` and wire into `orchestrator.ts`/`supervisor.ts`.
- Change DB schema: edit `drizzle/schema.ts`, run `pnpm db:push` to generate migrations and apply them.

What an AI agent should do first (priority checklist)
1. Open `server/_core/index.ts` to understand the dev/run cycle and API mount point.
2. Read `server/routers.ts` and `server/routers/acpa.ts` to learn exposed procedures and shapes.
3. Inspect `server/agents/*` to learn orchestration patterns and where to add agent logic.
4. Check `drizzle/schema.ts` and `package.json` scripts to understand DB workflows.

If something is missing or unclear
- Ask the developer which env vars to set (or provide a `.env.example` if none exists). Point to `README.md` for higher-level context.

Contact
- For repo-specific questions, reference these files in messages to the team: `server/_core/index.ts`, `server/routers.ts`, `server/agents/*`, `drizzle/schema.ts`, `client/src/lib/trpc.ts`.

End.

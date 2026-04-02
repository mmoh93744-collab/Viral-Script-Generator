# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)
- **AI**: OpenAI via Replit AI Integrations (gpt-5.2)

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.

## Artifacts

### HookForge (`artifacts/hookforge`)
- **Preview path**: `/`
- **Purpose**: Viral YouTube Shorts script generator using AI
- **Frontend**: React + Vite, dark theme, electric orange accent color (#FF4500)
- **Backend**: Express API with `/api/generate` endpoint
- **AI**: OpenAI gpt-5.2 via Replit AI Integrations
- **Free limit**: 2 requests per IP (in-memory, resets on server restart)
- **Monetization**: Stripe upgrade placeholder shown after limit

## API Routes

- `GET /api/healthz` — health check
- `POST /api/generate` — generate viral YouTube Shorts script
  - Body: `{ topic: string }`
  - Response: `{ hook, body, cta, remainingRequests, isLimitReached }`
  - 429 when free limit (2/day) reached with `{ error: "FREE_LIMIT_REACHED" }`

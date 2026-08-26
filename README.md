# SIH26191 Disaster Management Platform

Phase 0 foundation for Smart India Hackathon 2026 problem statement `SIH26191 [SW]`.

## Project Purpose

This repository is the starting point for a production-quality web platform that will eventually help disaster-management authorities:

1. identify multi-hazard Red Zones
2. assess safer relocation sites and their carrying capacity
3. prioritize vulnerable habitations for relocation
4. generate evidence-backed planning outputs

Phase 0 intentionally focuses on a trustworthy engineering foundation rather than fake analytics.

## Official SIH Requirements

The official problem statement requires a GIS-enabled decision-support platform that can:

1. dynamically identify and update multi-hazard Red Zones
2. assess the carrying capacity of safer alternative relocation sites
3. prioritize vulnerable habitations for immediate, short-term, and medium-term relocation
4. integrate hazard intensity, population vulnerability, and disaster history
5. provide actionable insights to State Disaster Management Authorities

## Our Proposed Implementation

The approved architecture lives in [docs/SIH26191_MASTER_BLUEPRINT.md](</C:/Users/mummi/Documents/Projects/Disaster Management/docs/SIH26191_MASTER_BLUEPRINT.md:1>).

The current repository follows that blueprint with:

1. Next.js App Router and strict TypeScript
2. Tailwind CSS for the application shell
3. Drizzle ORM with PostgreSQL/PostGIS-ready foundations
4. validated environment management
5. testing, linting, formatting, and build scripts
6. a professional command-center-style route shell

## Demo / Simulation Data Disclaimer

This Phase 0 foundation does **not** include official government operational data.

The seed infrastructure is designed for deterministic demo data later, but any seeded records must be clearly labeled as demo or simulation data. Nothing in this repository should be described as live government data unless a real integration is added and verified.

## Current Implementation Status

Implemented in Phase 0:

1. application shell and route structure
2. validated environment configuration
3. database client and initial schema foundation
4. Docker Compose setup for local PostGIS development
5. health endpoint and logging abstraction
6. unit, integration, and Playwright test scaffolding

Not implemented yet:

1. GIS analytics
2. risk engine
3. relocation engine
4. carrying-capacity engine
5. AI decision support
6. report generation
7. full demo dataset

## Technology Stack

1. Next.js 16 App Router
2. React 19
3. TypeScript
4. Tailwind CSS 4
5. PostgreSQL + PostGIS
6. Drizzle ORM
7. Zod
8. Vitest
9. Playwright
10. ESLint + Prettier
11. pnpm

## Architecture Overview

The repository follows a modular-monolith structure aligned with the master blueprint:

```text
docs/
public/
scripts/
src/
drizzle/
tests/
```

Core code groupings:

1. `src/app`: routes, layouts, and APIs
2. `src/components`: shared UI and shell components
3. `src/features`: module-oriented page content
4. `src/server`: database, health, auth groundwork, AI/GIS placeholders
5. `src/lib`: env validation, logging, validation helpers, utilities
6. `src/config`: app, risk, and capacity configuration surfaces

## Local Setup

### Prerequisites

1. Node.js 20.9 or newer
2. pnpm 11 or newer
3. Docker Desktop if you want the packaged PostGIS database

### Install dependencies

```bash
pnpm install
```

### Environment setup

Copy `.env.example` to `.env.local` and update values as needed.

Required variables:

1. `NODE_ENV`
2. `APP_ENV`
3. `NEXT_PUBLIC_APP_URL`
4. `DATABASE_URL`
5. `AUTH_SECRET`
6. `AI_PROVIDER`
7. `AI_MODEL`
8. `AI_API_KEY`
9. `DATABASE_HEALTHCHECK_TIMEOUT_MS`

## Database Setup

### Option A: Docker Compose with PostGIS

```bash
docker compose up -d
```

The bundled configuration uses the verified official image tag `postgis/postgis:17-3.5`, which Docker Hub lists as a current stable option and notes uses the legacy volume path `/var/lib/postgresql/data` as of the 2026 image overview. Source: [Docker Hub postgis/postgis](https://hub.docker.com/r/postgis/postgis).

### Option B: Local PostgreSQL/PostGIS installation

Use any local PostgreSQL instance with the PostGIS extension available, then point `DATABASE_URL` at that database.

### Run schema and seed commands

```bash
pnpm db:generate
pnpm db:migrate
pnpm db:seed
```

Phase 0 schema foundation currently includes:

1. `regions`
2. `data_sources`
3. `ingestion_runs`
4. `audit_events`

## Development Commands

```bash
pnpm dev
pnpm build
pnpm start
pnpm lint
pnpm typecheck
pnpm test
pnpm test:watch
pnpm test:e2e
pnpm format
pnpm format:check
```

## Health Check

The application exposes:

```text
/api/health
```

This endpoint reports:

1. application status
2. current environment
3. database connectivity status when checked safely

## Deployment Preparation

Phase 0 is deployment-ready at the shell level:

1. `next build` produces the production bundle
2. environment variables are validated
3. database connection wiring is centralized
4. secure response headers are configured

## Roadmap

Immediate next step:

1. implement the first real application spine from the blueprint:
   - seeded data model growth
   - first working data views
   - early GIS route implementation

Reference roadmap:

1. [docs/SIH26191_MASTER_BLUEPRINT.md](</C:/Users/mummi/Documents/Projects/Disaster Management/docs/SIH26191_MASTER_BLUEPRINT.md:1151>)


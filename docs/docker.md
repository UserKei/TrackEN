# Docker and Compose

This repository uses a pnpm workspace with a Next.js web app, shared packages, and the Nest server monorepo. The Compose file provides Postgres, Redis, MinIO, and production-style app services.

## Environment

Copy `.env.example` to `.env` for local Compose runs and replace secrets before any shared environment.

Important container hostnames:

- `postgres` for Postgres
- `redis` for Redis / BullMQ
- `minio` for S3-compatible storage

The example `DATABASE_URL`, `AI_DATABASE_URL`, Redis, and MinIO values already use these names.

## Profiles

- `dev` starts only infrastructure services: Postgres, Redis, MinIO, and bucket initialization.
- `preprod` starts infrastructure plus built web, server, and AI containers.
- `prod` uses the same production-oriented service graph as `preprod`; override images, ports, and secrets with environment variables or an additional Compose file.

Examples:

```sh
docker compose --profile dev up -d
docker compose --profile preprod up -d --build
docker compose --profile prod config
```

## Web Image

`Dockerfile.web` expects the migrated Next app to emit standalone output:

```js
// apps/web/next.config.*
export default {
  output: "standalone",
};
```

It runs `pnpm --filter @en/web build` and copies `.next/standalone`, `.next/static`, and `public` into the runtime image.
The runtime image runs `node apps/web/server.js` directly from the standalone output.

## Server Image

`Dockerfile.server` installs the workspace, runs Prisma generation, and builds both Nest applications:

```sh
pnpm exec prisma generate
pnpm exec nest build server
pnpm exec nest build ai
```

The `server` Compose service runs `dist/apps/server/main.js` on port 3000. The `ai` service reuses the same image and runs `dist/apps/ai/main.js` on port 3001.

Both Dockerfiles install the pinned pnpm version declared in the root `package.json` instead of relying on Corepack's moving default resolver.
The server build stage installs OpenSSL before Prisma generation so the generated client matches the Debian runtime image.

## Notes for Maintainers

- Do not commit real secrets. Use `.env.example` as documentation only.
- Pin `POSTGRES_IMAGE`, `REDIS_IMAGE`, `MINIO_IMAGE`, and `MINIO_MC_IMAGE` in shared environments.
- Compose healthchecks gate app startup on Postgres, Redis, MinIO, and bucket creation.
- Root package scripts can remain separate from this scaffold; add convenience scripts only after the app migration settles.

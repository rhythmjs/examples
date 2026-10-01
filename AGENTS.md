# Rhythm examples monorepo

This is a Bun workspace (`examples/*`) built entirely with Bun tooling; there is no Vite+, Turborepo, or pnpm here.
Each workspace is a self-contained app on the Rhythm kernel: notes CRUD with a different database stack (Drizzle, Prisma,
MikroORM on PostgreSQL; the native MongoDB driver), or one integration recipe (AI SDK, Better Auth, Nodemailer, Redis,
Resend, file upload, Scalar, Swagger UI) that the docs at https://rhythm.js.org/integrations/ link to. The integration
examples are the starter template (app.module/app.controller/app.service/main + a unit spec and an e2e spec in test/) plus only
what the integration adds; do not rebuild them as bespoke apps. Do not wrap a module in a factory to inject a dependency: wrap a
service (a plain object the module provides) and stub it in tests, or pass the value through `@rhythmjs/config`.

- `bun install` after pulling changes.
- `docker compose up -d` starts PostgreSQL 17, MongoDB 8, Redis, Mailpit and MinIO for local runs; `docker/postgres-init.sql` creates one
  database per Postgres example.
- `bun run typecheck` type-checks every workspace (`tsc --noEmit`). The Prisma example needs a generated client first:
  `bun run --filter prisma-postgres-example db:generate` (no database required).
- `bun run test` runs every workspace spec (`bun test`); specs that need Redis or MinIO skip themselves when it is unreachable. They test
  through `toFetchHandler(app)`: `createTestClient` from `@rhythmjs/testing` does not typecheck with apps that use `provide()`.
- `bun run check` = prettier check + oxlint + typecheck. `bun run fmt` formats. Prettier config is the root
  `.prettierrc.json`.
- Conventions: Nest-style file names (`app.module.ts`, `notes.controller.ts`, `notes.service.ts`), lowerCamelCase
  instances (`appModule`, `notesController`), factories over classes (`createNotesService(db)`), database connections
  as `provide(factory, dispose)` providers so `appModule.teardown()` releases them.

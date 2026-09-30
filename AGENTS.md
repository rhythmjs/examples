# Rhythm examples monorepo

This is a Bun workspace (`examples/*`) built entirely with Bun tooling; there is no Vite+, Turborepo, or pnpm here.
Each workspace is a self-contained notes CRUD app on the Rhythm kernel with a different database stack (Drizzle,
Prisma, MikroORM on PostgreSQL; the native MongoDB driver).

- `bun install` after pulling changes.
- `docker compose up -d` starts PostgreSQL 17 and MongoDB 8 for local runs; `docker/postgres-init.sql` creates one
  database per Postgres example.
- `bun run typecheck` type-checks every workspace (`tsc --noEmit`). The Prisma example needs a generated client first:
  `bun run --filter prisma-postgres-example db:generate` (no database required).
- `bun run check` = prettier check + oxlint + typecheck. `bun run fmt` formats. Prettier config is the root
  `.prettierrc.json`.
- Conventions: Nest-style file names (`app.module.ts`, `notes.controller.ts`, `notes.service.ts`), lowerCamelCase
  instances (`appModule`, `notesController`), factories over classes (`createNotesService(db)`), database connections
  as `provide(factory, dispose)` providers so `appModule.teardown()` releases them.

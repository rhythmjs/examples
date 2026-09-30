# Rhythm database examples

A Bun workspace of small, self-contained apps showing how to wire a database into
[Rhythm](https://rhythm.js.org) properly: the connection is a `provide(factory, dispose)` provider, the
service is a factory resolved from that provider, the controller is a `RhythmRouter`, and
`appModule.teardown()` closes everything on shutdown. Request/response contracts are
[zod](https://zod.dev) schemas enforced with `@rhythmjs/middleware`: `validate("body", …)` on writes,
`intercept(…)` on responses, and a `filter()` error boundary that turns thrown `HttpError`s (and anything
unexpected) into JSON failures.

Every example serves the same notes CRUD API:

| Method | Path             |                          |
| ------ | ---------------- | ------------------------ |
| GET    | `/api/notes`     | list notes               |
| GET    | `/api/notes/:id` | get one (404 if missing) |
| POST   | `/api/notes`     | create (201)             |
| PATCH  | `/api/notes/:id` | partial update           |
| DELETE | `/api/notes/:id` | delete (204)             |

## Examples

| Example                                                  | Stack                                    | Port |
| -------------------------------------------------------- | ---------------------------------------- | ---- |
| [`examples/drizzle-postgres`](examples/drizzle-postgres) | Drizzle ORM + Bun native SQL, PostgreSQL | 3001 |
| [`examples/prisma-postgres`](examples/prisma-postgres)   | Prisma, PostgreSQL                       | 3002 |
| [`examples/mikro-orm-postgres`](examples/mikro-orm-postgres) | MikroORM (`EntitySchema`), PostgreSQL | 3003 |
| [`examples/mongodb`](examples/mongodb)                   | Official MongoDB driver                  | 3004 |

## Getting started

```sh
docker compose up -d   # PostgreSQL 17 (databases created by docker/postgres-init.sql) + MongoDB 8
bun install
```

Then follow the README of the example you want — each has its own `db:migrate` (checked-in migration files, where a schema is needed) and
`bun run dev`.

## Structure

Each example follows the Rhythm template conventions:

```
src/
  main.ts                 Bun.serve + toFetchHandler(appModule), graceful teardown on SIGINT/SIGTERM
  app.module.ts           appModule: filter() error boundary → db provider → notesService provider → controller → 404
  database.ts             createDatabase/closeDatabase factory + dispose pair
  notes/
    notes.schema.ts       zod schemas: create/update inputs + the response contract
    notes.controller.ts   notesController: RhythmRouter (/api/notes), validate("body") + intercept(response)
    notes.service.ts      createNotesService(db) factory — all persistence lives here
```

The Drizzle example keeps its table definition in `src/notes/notes.table.ts`, and the MikroORM example its
`EntitySchema` in `src/notes/note.entity.ts` — everything notes-related lives under `src/notes/`.

Migrations are checked in per ORM convention: `drizzle/*.sql` (from `drizzle-kit generate`),
`prisma/migrations/*` (applied with `prisma migrate deploy`), and `src/migrations/*.ts` (MikroORM `Migrator`,
applied by `bun run db:migrate`). MongoDB is schemaless — the collection and its index are created at startup.

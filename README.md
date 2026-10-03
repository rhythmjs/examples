# Rhythm examples

A Bun workspace of small, self-contained apps showing how to wire a database, or another tool, into
[Rhythm](https://rhythm.js.org) properly: the connection is created at startup in `main.ts` and assigned to
`appModule.context`, the service is a factory the module builds from that connection, the controller is a
`RhythmRouter`, and `main.ts` closes the connection on shutdown. Request/response contracts are
[zod](https://zod.dev) schemas enforced with `@rhythmjs/middleware`: `validate("body", …)` on writes,
`intercept(…)` on responses, and a `filter()` error boundary that turns thrown `HttpError`s (and anything
unexpected) into JSON failures.

The four database examples serve the same notes CRUD API:

| Method | Path             |                          |
| ------ | ---------------- | ------------------------ |
| GET    | `/api/notes`     | list notes               |
| GET    | `/api/notes/:id` | get one (404 if missing) |
| POST   | `/api/notes`     | create (201)             |
| PATCH  | `/api/notes/:id` | partial update           |
| DELETE | `/api/notes/:id` | delete (204)             |

## Examples

| Example                                                      | Stack                                    | Port |
| ------------------------------------------------------------ | ---------------------------------------- | ---- |
| [`examples/drizzle-postgres`](examples/drizzle-postgres)     | Drizzle ORM + Bun native SQL, PostgreSQL | 3001 |
| [`examples/prisma-postgres`](examples/prisma-postgres)       | Prisma, PostgreSQL                       | 3002 |
| [`examples/mikro-orm-postgres`](examples/mikro-orm-postgres) | MikroORM (`defineEntity`), PostgreSQL    | 3003 |
| [`examples/mongodb`](examples/mongodb)                       | Official MongoDB driver                  | 3004 |

### Integrations

Each of these backs a recipe in the [integrations docs](https://rhythm.js.org/integrations/ai-sdk/). They are built from the
[template](https://github.com/rhythmjs/template): the same module, controller, service, `main.ts` and tests, plus only what the
integration adds. Each README lists exactly what was added.

| Example                                        | Stack                                                                     | Port | Needs                                      |
| ---------------------------------------------- | ------------------------------------------------------------------------- | ---- | ------------------------------------------ |
| [`examples/ai-sdk`](examples/ai-sdk)           | Vercel AI SDK: streaming chat, summary, model swap via `@rhythmjs/config` | 3008 | `OPENAI_API_KEY` to run (tests use a mock) |
| [`examples/better-auth`](examples/better-auth) | Better Auth (email + password) on Bun SQLite                              | 3007 | nothing                                    |
| [`examples/bullmq`](examples/bullmq)           | `@rhythmjs/bullmq`: typed job queue and worker on BullMQ                  | 3013 | Redis                                      |
| [`examples/file-upload`](examples/file-upload) | `multipart` uploads to disk and to S3 (MinIO)                             | 3012 | MinIO for the S3 route                     |
| [`examples/nodemailer`](examples/nodemailer)   | Nodemailer over SMTP (Mailpit) or a JSON transport                        | 3009 | nothing (Mailpit optional)                 |
| [`examples/redis`](examples/redis)             | Bun `RedisClient` cache-aside                                             | 3011 | Redis                                      |
| [`examples/resend`](examples/resend)           | Resend email API                                                          | 3010 | `RESEND_API_KEY` to run (tests use a fake) |
| [`examples/scalar`](examples/scalar)           | `@rhythmjs/openapi` + `@rhythmjs/scalar`                                  | 3005 | nothing                                    |
| [`examples/swagger-ui`](examples/swagger-ui)   | `@rhythmjs/openapi` + `@rhythmjs/swagger`                                 | 3006 | nothing                                    |

`bun run test` runs every spec. The ones that need a service skip themselves with a message when it is not reachable.

## Getting started

```sh
docker compose up -d   # PostgreSQL 17 (databases created by docker/postgres-init.sql), MongoDB 8, Redis, Mailpit, MinIO
bun install
```

Then follow the README of the example you want — each has its own `db:migrate` (checked-in migration files, where a schema is needed) and
`bun run dev`.

## Structure

Each example follows the Rhythm template conventions:

```
src/
  main.ts                 Bun.serve + toFetchHandler(appModule), creates the connection and assigns it to appModule.context; closes it on SIGINT/SIGTERM
  app.module.ts           appModule: filter() error boundary → notes module (derives notesService from ctx.db) → 404
  database.ts             createDatabase() → { <connection>, close() }
  notes/
    notes.schema.ts       zod schemas: create/update inputs + the response contract
    notes.controller.ts   notesController: RhythmRouter (/api/notes), validate("body") + intercept(response)
    notes.service.ts      createNotesService(db) factory — all persistence lives here
```

The Drizzle example keeps its table definition in `src/notes/notes.table.ts`, and the MikroORM example its
`defineEntity` schema in `src/notes/note.entity.ts` — everything notes-related lives under `src/notes/`.

Migrations are checked in per ORM convention: `drizzle/*.sql` (from `drizzle-kit generate`),
`prisma/migrations/*` (applied with `prisma migrate deploy`), and `src/migrations/*.ts` (MikroORM `Migrator`,
applied by `bun run db:migrate`). MongoDB is schemaless — the collection and its index are created at startup.

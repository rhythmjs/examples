# drizzle-postgres-example

Notes CRUD on Rhythm with [Drizzle ORM](https://orm.drizzle.team) and Bun's native `SQL` driver (`drizzle-orm/bun-sql`)
against PostgreSQL.

## How it fits together

- `src/database.ts`: the client factory. `createDatabase()` builds the Drizzle client on Bun's native `SQL` driver (`drizzle-orm/bun-sql`).
- `src/database.module.ts`: `databaseModule` is an infrastructure `Rhythm` module. It registers the client with `decorate(...)` and closes it as the `register` cleanup.
- `src/notes/notes.module.ts`: `notesModule` is the self-contained feature module. It `include`s `databaseModule`, builds `notesService` with `decorate(...)` and mounts its own controller with `.use(mount(notesController))`.
- `src/notes/notes.controller.ts`: a `RhythmRouter` with full paths (`/api/notes`, `/api/notes/:id`). `filter()` turns thrown `HttpError`s into JSON failures, `validate("body", ...)` guards the write routes and `intercept(notesResponseSchema)` enforces the response contract. The zod schemas live in `src/notes/notes.schema.ts`.
- `src/app.module.ts`: `appModule` `include`s `databaseModule` so `appModule.stop()` closes the connection (a mounted module does not register cleanups), and adds the feature with `.use(mount(notesModule))`.
- `src/main.ts`: `Bun.serve({ fetch: toFetchHandler(appModule) })`, and `appModule.stop()` on shutdown.

## Run

```sh
# from the repo root
docker compose up -d postgres
bun install

cd examples/drizzle-postgres
bun run db:migrate   # apply drizzle/*.sql migrations
bun run dev       # http://localhost:3001
```

`DATABASE_URL` overrides the default `postgres://postgres:postgres@localhost:5432/notes_drizzle`. After changing
`src/notes/notes.table.ts`, run `bun run db:generate` to emit a new migration into `drizzle/`.

## Endpoints

```sh
curl http://localhost:3001/api/notes
curl -X POST http://localhost:3001/api/notes -H 'content-type: application/json' -d '{"title":"hello","content":"world"}'
curl http://localhost:3001/api/notes/<id>
curl -X PATCH http://localhost:3001/api/notes/<id> -H 'content-type: application/json' -d '{"content":"updated"}'
curl -X DELETE http://localhost:3001/api/notes/<id>
```

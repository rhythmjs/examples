# mikro-orm-postgres-example

Notes CRUD on Rhythm with [MikroORM](https://mikro-orm.io) against PostgreSQL.

## How it fits together

- `src/database.ts`: the client factory. `createOrm()` initialises MikroORM. The entity is declared with `defineEntity` (no decorators, no `reflect-metadata`), and the notes service forks a fresh `EntityManager` per operation, as MikroORM requires.
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

cd examples/mikro-orm-postgres
bun run db:migrate   # apply src/migrations/* (MikroORM Migrator)
bun run dev       # http://localhost:3003
```

`DATABASE_URL` overrides the default `postgres://postgres:postgres@localhost:5432/notes_mikro_orm`. Migration
classes live in `src/migrations/` and are applied through the MikroORM `Migrator` extension.

## Endpoints

```sh
curl http://localhost:3003/api/notes
curl -X POST http://localhost:3003/api/notes -H 'content-type: application/json' -d '{"title":"hello","content":"world"}'
curl http://localhost:3003/api/notes/<id>
curl -X PATCH http://localhost:3003/api/notes/<id> -H 'content-type: application/json' -d '{"content":"updated"}'
curl -X DELETE http://localhost:3003/api/notes/<id>
```

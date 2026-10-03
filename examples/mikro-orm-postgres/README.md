# mikro-orm-postgres-example

Notes CRUD on Rhythm with [MikroORM](https://mikro-orm.io) against PostgreSQL.

The entity is declared with `defineEntity` (no decorators, no `reflect-metadata` — Bun-friendly). `createDatabase()` initialises the ORM at startup and returns it with a `close()` (`orm.close()`); `main.ts` assigns it to
`appModule.context.orm` and calls `close()` on shutdown. The notes service
is a factory (`createNotesService(orm)`) that forks a fresh `EntityManager` per operation, as MikroORM requires.

Validation and errors use zod + `@rhythmjs/middleware`: `validate("body", createNoteSchema)` /
`validate("body", updateNoteSchema)` guard the write routes, `intercept(notesResponseSchema)` enforces the response
contract, and a `filter()` boundary in `appModule` turns thrown `HttpError`s into JSON failures. All zod schemas live
in `src/notes/notes.schema.ts`.

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

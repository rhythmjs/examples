# drizzle-postgres-example

Notes CRUD on Rhythm with [Drizzle ORM](https://orm.drizzle.team) and Bun's native `SQL` driver (`drizzle-orm/bun-sql`)
against PostgreSQL.

`createDatabase()` returns the drizzle `db` with a `close()` for the pool. `main.ts` assigns `db` to
`appModule.context.db` and calls `close()` on shutdown. The notes service is a factory (`createNotesService(db)`) the
notes module builds from `ctx.db`.

Validation and errors use zod + `@rhythmjs/middleware`: `validate("body", createNoteSchema)` /
`validate("body", updateNoteSchema)` guard the write routes, `intercept(notesResponseSchema)` enforces the response
contract, and a `filter()` boundary in `appModule` turns thrown `HttpError`s into JSON failures. All zod schemas live
in `src/notes/notes.schema.ts`.

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

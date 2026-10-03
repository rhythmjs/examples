# mongodb-example

Notes CRUD on Rhythm with the official [MongoDB driver](https://www.mongodb.com/docs/drivers/node/current/) — no ORM.

`createDatabase()` connects at startup and returns the `Db` together with a `close()` that owns the `MongoClient`. `main.ts`
assigns the `Db` to `appModule.context.db` (typed by `Rhythm<RhythmHttpContext, { db: Db }>`) and calls `close()` on shutdown. The notes service is a factory (`createNotesService(db)`) that maps `_id: ObjectId` documents
to `id: string` DTOs at the boundary.

Validation and errors use zod + `@rhythmjs/middleware`: `validate("body", createNoteSchema)` /
`validate("body", updateNoteSchema)` guard the write routes, `intercept(notesResponseSchema)` enforces the response
contract, and a `filter()` boundary in `appModule` turns thrown `HttpError`s into JSON failures. All zod schemas live
in `src/notes/notes.schema.ts`.

## Run

```sh
# from the repo root
docker compose up -d mongodb
bun install

cd examples/mongodb
bun run dev   # http://localhost:3004 — no migration step, Mongo creates the collection on first write
```

`MONGODB_URL` (default `mongodb://localhost:27017`) and `MONGODB_DB` (default `notes_mongodb`) override the defaults.

## Endpoints

```sh
curl http://localhost:3004/api/notes
curl -X POST http://localhost:3004/api/notes -H 'content-type: application/json' -d '{"title":"hello","content":"world"}'
curl http://localhost:3004/api/notes/<id>
curl -X PATCH http://localhost:3004/api/notes/<id> -H 'content-type: application/json' -d '{"content":"updated"}'
curl -X DELETE http://localhost:3004/api/notes/<id>
```

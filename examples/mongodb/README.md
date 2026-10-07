# mongodb-example

Notes CRUD on Rhythm with the official [MongoDB driver](https://www.mongodb.com/docs/drivers/node/current/), no ORM.

## How it fits together

- `src/database.ts`: the client factory. `createDatabase()` connects the official `MongoClient` and creates the index. The notes service maps `_id: ObjectId` documents to `id: string` DTOs.
- `src/database.module.ts`: `databaseModule` is an infrastructure `Rhythm` module. It registers the client with `decorate(...)` and closes it as the `register` cleanup.
- `src/notes/notes.module.ts`: `notesModule` is the self-contained feature module. It `include`s `databaseModule`, builds `notesService` with `decorate(...)` and mounts its own controller with `.use(mount(notesController))`.
- `src/notes/notes.controller.ts`: a `RhythmRouter` with full paths (`/api/notes`, `/api/notes/:id`). `filter()` turns thrown `HttpError`s into JSON failures, `validate("body", ...)` guards the write routes and `intercept(notesResponseSchema)` enforces the response contract. The zod schemas live in `src/notes/notes.schema.ts`.
- `src/app.module.ts`: `appModule` `include`s `databaseModule` so `appModule.stop()` closes the connection (a mounted module does not register cleanups), and adds the feature with `.use(mount(notesModule))`.
- `src/main.ts`: `Bun.serve({ fetch: toFetchHandler(appModule) })`, and `appModule.stop()` on shutdown.

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

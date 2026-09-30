# prisma-postgres-example

Notes CRUD on Rhythm with [Prisma](https://www.prisma.io) against PostgreSQL.

`PrismaClient` is a Rhythm provider with a dispose hook (`$disconnect`), so `appModule.teardown()` closes the
connection on shutdown. The notes service is a factory (`createNotesService(prisma)`) resolved from the `prisma`
provider.

Validation and errors use zod + `@rhythmjs/middleware`: `validate("body", createNoteSchema)` /
`validate("body", updateNoteSchema)` guard the write routes, `intercept(notesResponseSchema)` enforces the response
contract, and a `filter()` boundary in `appModule` turns thrown `HttpError`s into JSON failures. All zod schemas live
in `src/notes/notes.schema.ts`.

## Run

```sh
# from the repo root
docker compose up -d postgres
bun install

cd examples/prisma-postgres
cp .env.example .env   # the Prisma CLI reads DATABASE_URL from .env
bun run db:generate    # generate the Prisma client
bun run db:migrate     # apply prisma/migrations/*
bun run dev            # http://localhost:3002
```

At runtime `DATABASE_URL` overrides the default `postgres://postgres:postgres@localhost:5432/notes_prisma`.

## Endpoints

```sh
curl http://localhost:3002/api/notes
curl -X POST http://localhost:3002/api/notes -H 'content-type: application/json' -d '{"title":"hello","content":"world"}'
curl http://localhost:3002/api/notes/<id>
curl -X PATCH http://localhost:3002/api/notes/<id> -H 'content-type: application/json' -d '{"content":"updated"}'
curl -X DELETE http://localhost:3002/api/notes/<id>
```

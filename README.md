# Rhythm examples

A Bun workspace of small, self-contained apps showing how to wire a database, or another tool, into
[Rhythm](https://rhythm.js.org) properly. Each app is split into self-contained modules: the connection lives in an
infrastructure module (created once, closed on stop), a feature module `include`s it, builds its service from it and mounts its own
controller, and the app module just mounts the feature modules. Request/response contracts in the database examples are
[zod](https://zod.dev) schemas enforced with `@rhythmjs/middleware`: `validate("body", …)` on writes,
`intercept(…)` on responses, and a `filter()` error boundary on the router that turns thrown `HttpError`s (and anything
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
| [`examples/file-upload`](examples/file-upload) | `multipart` uploads to disk and to S3 (MinIO)                             | 3012 | MinIO for the S3 route                     |
| [`examples/nodemailer`](examples/nodemailer)   | Nodemailer over SMTP (Mailpit) or a JSON transport                        | 3009 | nothing (Mailpit optional)                 |
| [`examples/redis`](examples/redis)             | Bun `RedisClient` cache-aside                                             | 3011 | Redis                                      |
| [`examples/resend`](examples/resend)           | Resend email API                                                          | 3010 | `RESEND_API_KEY` to run (tests use a fake) |
| [`examples/scalar`](examples/scalar)           | `@rhythmjs/openapi` + `@rhythmjs/scalar`                                  | 3005 | nothing                                    |
| [`examples/swagger-ui`](examples/swagger-ui)   | `@rhythmjs/openapi` + `@rhythmjs/swagger`                                 | 3006 | nothing                                    |

The Scalar and Swagger UI examples cover the OpenAPI docs UIs (`documented()` routers plus `scalarModule` / `swaggerModule`), and the
rest cover email, Redis and the remaining integrations. For scheduled work, see `@rhythmjs/cron`; for WebSockets, `@rhythmjs/ws`
(both have their own examples in their repos).

`bun run test` runs every spec. The ones that need a service skip themselves with a message when it is not reachable.

## Getting started

```sh
docker compose up -d   # PostgreSQL 17 (databases created by docker/postgres-init.sql), MongoDB 8, Redis, Mailpit, MinIO
bun install
```

Then follow the README of the example you want — each has its own `db:migrate` (checked-in migration files, where a schema is needed) and
`bun run dev`.

## Structure

Every example follows the same module layout (file names are Nest-style, instances are lowerCamelCase):

```
src/
  main.ts                 Bun.serve({ fetch: toFetchHandler(appModule) }); appModule.stop() on shutdown
  app.module.ts           appModule: include the infra module(s) for lifecycle, mount(featureModule)
  <infra>/<infra>.module.ts       redisModule, databaseModule, transportModule: a Rhythm instance that registers the client
  <feature>/<feature>.module.ts   notesModule, productsModule, mailModule: include infra, decorate the service, mount the controller
  <feature>/<feature>.controller.ts   RhythmRouter with full paths
  <feature>/<feature>.service.ts      createFeatureService(client) factory (or a plain service object)
```

```ts
// redis.module.ts: the infrastructure module, one instance, cleanup is the second argument of register
export const redisModule = new Rhythm({ name: "redis" }).register(
  decorate(() => ({ redis })),
  () => redis.close(),
);

// products.module.ts: the feature module
export const productsModule = new Rhythm({ name: "products" })
  .register(include(redisModule, ({ redis }) => ({ redis })))
  .register(decorate(({ redis }) => ({ productsService: createProductsService(redis) })))
  .use(mount(productsController));

// app.module.ts
export const appModule = new Rhythm({ name: "app" })
  .register(include(redisModule, ({ redis }) => ({ redis })))
  .use(mount(productsModule));
```

Rules that make this work:

- `register` is sequential: a `register` callback waits for every earlier `register`, including an async `include(...)`, so the
  `decorate` after an `include` sees the picked fields (`redis` above). If a registration fails, the later ones are skipped.
- A feature module that mounts a controller is `mount`ed, never `include`d: `include` runs the module once at startup with no request,
  `mount` runs it per request.
- A mounted module does not register cleanups. The app module therefore also `include`s the infrastructure module, which is what
  makes `appModule.stop()` close the client. The infra instance creates its client at module level, so every `include` shares it.
- A module with nothing to close (a stateless mail service, a model client) needs no infra module and no `include` in the app module.
- No per-request `derive` for services and no wrapper around routers: services are put on the startup context with `decorate`, and
  controllers stay plain `RhythmRouter`s whose context type lists what they read.
- Tests call the app through `toFetchHandler(appModule)`; a controller spec mounts the controller alone with
  `runHttpMiddleware(mount(controller), path, { service })`.

Migrations in the ORM examples are checked in per ORM convention (see each README). MongoDB is schemaless.

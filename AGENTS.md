# Rhythm examples monorepo

This is a Bun workspace (`examples/*`) built entirely with Bun tooling; there is no Vite+, Turborepo, or pnpm here.
Each workspace is a self-contained app on the Rhythm kernel: notes CRUD with a different database stack (Drizzle, Prisma,
MikroORM on PostgreSQL; the native MongoDB driver), or one integration recipe (AI SDK, Better Auth, Nodemailer, Redis,
Resend, file upload, Scalar, Swagger UI) that the docs at https://rhythm.js.org/integrations/ link to. The integration
examples are the starter template (app.module/app.controller/app.service/main + a unit spec and an e2e spec in test/) plus only
what the integration adds; do not rebuild them as bespoke apps. Do not wrap a module in a factory to inject a dependency: put a
service on the startup context with `decorate(() => ({ ... }))` (or `include` a child Rhythm such as `configModule.forRoot()`) and stub
it in tests, or pass the value through `@rhythmjs/config`.

- `bun install` after pulling changes.
- `docker compose up -d` starts PostgreSQL 17, MongoDB 8, Redis, Mailpit and MinIO for local runs; `docker/postgres-init.sql` creates one
  database per Postgres example.
- `bun run typecheck` type-checks every workspace (`tsc --noEmit`). The Prisma example needs a generated client first:
  `bun run --filter prisma-postgres-example db:generate` (no database required).
- `bun run test` runs every workspace spec (`bun test`); specs that need Redis or MinIO skip themselves when it is unreachable. They call the app through `toFetchHandler(appModule)`
  and stop it (`appModule.stop()`) or close what they created in `afterAll`. Unit specs mount the controller with
  `runHttpMiddleware(mount(controller), path, input)` from `@rhythmjs/testing/router`.
- `bun run check` = prettier check + oxlint + typecheck. `bun run fmt` formats. Prettier config is the root
  `.prettierrc.json`.
- Conventions: Nest-style file names (`app.module.ts`, `notes.module.ts`, `notes.controller.ts`, `notes.service.ts`), lowerCamelCase
  instances (`appModule`, `notesModule`, `redisModule`), factories over classes (`createNotesService(db)`). Controllers are
  `RhythmRouter`s with full paths (no prefix); types come from inference. Packages come from npm (caret ranges), there are no `file:` overrides.
- Module layout (self-contained feature modules):
  - An infrastructure module (database, redis, mail transport) is a `Rhythm` instance created once and exported as a plain
    lowerCamelCase instance. It registers the client with `.register(decorate(() => ({ client })), () => close(client))`; the cleanup is the second
    argument of `register`. Create the client at module level so every `include` shares it.
  - A feature module (`<feature>/<feature>.module.ts`) `include`s the infra module(s) it needs, builds its service with
    `.register(decorate(({ client }) => ({ featureService: createFeatureService(client) })))` and mounts its controller(s) with
    `.use(mount(featureController))`. No per-request `derive` for services, no memoizing closures, no wrapper around routers.
  - The app module `include`s the infra module(s) for lifecycle (a mounted module does not register cleanups, so this is what lets
    `appModule.stop()` close them) and does `.use(mount(featureModule))`. A module that mounts a controller is always `mount`ed, never
    `include`d (include runs its pipeline once at startup with no request). `main.ts` keeps `Bun.serve({ fetch: toFetchHandler(appModule) })` and `appModule.stop()`.
  - `Rhythm.register` is sequential: a `register` callback waits for any earlier async `register` (such as `include(...)`), so a
    `decorate` after an `include` sees the included fields. A failed registration skips the later ones. Rely on this instead of
    nesting or deferring work.
  - Modules with nothing to close (stateless services) need no infra module and no `include` in the app module.

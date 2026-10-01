# better-auth-example

Built from the [template](https://github.com/rhythmjs/template): its `app.module.ts`, `app.controller.ts`, `app.service.ts`, `main.ts` and tests, plus [Better Auth](https://www.better-auth.com) (email and password on a Bun SQLite file), CORS for a separate frontend, and a guarded route.

## What is added to the template

- `bun add better-auth @rhythmjs/better-auth`
- `src/lib/auth.ts`: the Better Auth instance; the frontend origin (`FRONTEND_URL`, default `http://localhost:3001`) is in `trustedOrigins`, which checks origins separately from CORS.
- [`@rhythmjs/better-auth`](https://www.npmjs.com/package/@rhythmjs/better-auth): `betterAuthModule.forRoot({ auth, path })` mounts Better Auth's handler and provides `auth`, `withSession()` puts `session` and `user` on the context (`null` when anonymous), and `requireSession()` answers 401 when there is none and narrows both for the handler. Both middlewares read `ctx.auth`, which the app module exports from the better-auth module.
- `src/lib/migrate.ts`: creates Better Auth's tables (`bun run db:migrate`; `bun run dev` also runs it at startup).
- `src/app.module.ts`: `cors()`, then `betterAuthModule.forRoot({ auth, path: "/api/auth" })` (exporting `auth`) and `withSession()`, all before the controller. CORS comes first so preflights are answered and Better Auth's own responses carry the headers.
- `src/app.controller.ts`: `GET /me`, guarded per route with `requireSession`.

Set `BETTER_AUTH_SECRET` and `BETTER_AUTH_URL` outside local runs. `AUTH_DB` changes the SQLite file.

## Run

```sh
# from the repo root
bun install

cd examples/better-auth
bun run dev    # http://localhost:3007
```

## Try it

```sh
curl -c jar -X POST http://localhost:3007/api/auth/sign-up/email -H 'content-type: application/json' \
  -d '{"name":"Ada","email":"ada@example.com","password":"correct-horse-battery"}'
curl -b jar http://localhost:3007/me      # the signed-in user
curl http://localhost:3007/me             # 401 without a session
```

## Test

```sh
bun test          # the template's controller spec
bun run test:e2e  # the template's e2e spec, plus the e2e spec runs against an in-memory database: the guard, sign-up followed by an authenticated request, a rejected wrong password, and the CORS preflight and headers.
```

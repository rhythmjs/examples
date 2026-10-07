# nodemailer-example

A signup endpoint that sends a welcome email with [Nodemailer](https://nodemailer.com).

## How it fits together

- `src/mail/transport.module.ts`: `transportModule` is the infrastructure module. It registers the Nodemailer `transport` with `decorate` and closes it as the cleanup of `register`. With `SMTP_HOST` set, mail goes over SMTP; without it, the JSON transport builds each message and returns it instead of sending, so the example runs and tests with no mail server.
- `src/mail/mail.module.ts`: `mailModule` is the feature module. It `include`s `transportModule`, builds `mailService` with `decorate` (a later `register` sees what an earlier one added), and mounts `mailController` with `mount`.
- `src/mail/mail.controller.ts`: `POST /signup` sends the welcome mail through `ctx.mailService`.
- `src/app.module.ts`: includes `transportModule` so `app.stop()` closes the transport, adds `appService`, and mounts `appController` and `mailModule`.
- `src/main.ts`: `Bun.serve({ fetch: toFetchHandler(appModule) })`, and `appModule.stop()` on shutdown.

For a real inbox, `docker compose up -d mailpit` starts [Mailpit](https://mailpit.axllent.org) (SMTP on 1025, web inbox on 8025).

## Run

```sh
# from the repo root
bun install
docker compose up -d mailpit   # optional, for real delivery

cd examples/nodemailer
bun run dev    # http://localhost:3009
```

## Try it

```sh
SMTP_HOST=localhost SMTP_PORT=1025 bun run dev   # deliver to Mailpit; omit the variables to use the JSON transport
curl -X POST http://localhost:3009/signup -H 'content-type: application/json' -d '{"name":"Ada","email":"ada@example.com"}'
open http://localhost:8025
```

## Test

```sh
bun test          # controller specs, the mail one with a stubbed mail service
bun run test:e2e  # the whole app with the JSON transport: a 201 with a message id and a 400 for an invalid address
```

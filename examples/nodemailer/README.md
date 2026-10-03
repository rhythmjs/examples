# nodemailer-example

Built from the [template](https://github.com/rhythmjs/template): its `app.module.ts`, `app.controller.ts`, `app.service.ts`, `main.ts` and tests, plus [Nodemailer](https://nodemailer.com): a signup endpoint that sends a welcome email.

## What is added to the template

- `bun add nodemailer` (and `@types/nodemailer` for development)
- `src/mail/mail.ts`: `createMailer()` returns the `mailer` and a `close()` for the transport; `main.ts` assigns the mailer to `appModule.context.mailer` and calls `close()` on shutdown. With `SMTP_HOST` set, mail goes over SMTP; without it, the JSON transport builds each message and returns it instead of sending, so the example runs and tests with no mail server.
- `src/app.module.ts`: `mailer` is declared on the module's context (`Rhythm<RhythmHttpContext, { appService; mailer }>`).
- `src/app.controller.ts`: `POST /signup` sends the welcome mail through `ctx.mailer`.

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
bun test          # the template's controller spec
bun run test:e2e  # the template's e2e spec, plus the JSON transport: the 201 with a message id, and a 400 for an invalid address with no mail built.
```

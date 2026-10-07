# resend-example

A contact form endpoint that sends email through [Resend](https://resend.com)'s HTTP API.

## How it fits together

- `src/mail/mail.service.ts`: `mailService.send` wraps `emails.send` with a lazily created client (the SDK throws without an API key, so nothing is built until the first send), which also lets tests stub the service.
- `src/mail/mail.module.ts`: `mailModule` is the feature module. It provides `mailService` with `decorate` and mounts `mailController` with `mount`. There is no connection to close, so no infrastructure module.
- `src/mail/mail.controller.ts`: `POST /contact`. Resend does not throw for API errors, so an `error` in its `{ data, error }` result becomes a 502 instead of a false success. User input is escaped before it goes into the HTML.
- `src/app.module.ts`: adds `appService` with `decorate` and mounts `appController` and `mailModule`.
- `src/main.ts`: `Bun.serve({ fetch: toFetchHandler(appModule) })`.

`RESEND_API_KEY` is needed to send (create one at https://resend.com/api-keys). Until you verify a domain, send from `onboarding@resend.dev`, the default here; `MAIL_FROM` overrides it.

## Run

```sh
# from the repo root
bun install

cd examples/resend
bun run dev    # http://localhost:3010
```

## Try it

```sh
RESEND_API_KEY=re_... bun run dev
curl -X POST http://localhost:3010/contact -H 'content-type: application/json' -d '{"email":"you@example.com","message":"Hello"}'
```

## Test

```sh
bun test          # controller specs, the mail one with a stubbed mail service
bun run test:e2e  # the whole app with `mailService.send` stubbed: the 202 with the email id, escaping of user input, a 502 when Resend answers with an error, and a 400 that sends nothing
```

# resend-example

Built from the [template](https://github.com/rhythmjs/template): its `app.module.ts`, `app.controller.ts`, `app.service.ts`, `main.ts` and tests, plus [Resend](https://resend.com)'s HTTP API: a contact form endpoint.

## What is added to the template

- `bun add resend`
- `src/mail/mail.service.ts`: `mailService.send` wraps `emails.send` with a lazily created client, so tests stub the service.
- `src/app.controller.ts`: `POST /contact` handles Resend's `{ data, error }` result: Resend does not throw for API errors, so an `error` becomes a 502 instead of a false success. User input is escaped before it goes into the HTML.
- `src/app.module.ts`: `mailService` is provided next to `appService`.

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
bun test          # the template's controller spec
bun run test:e2e  # the template's e2e spec, plus a stubbed `mailService`: the 202 with the email id, escaping of user input, a 502 when Resend answers with an error, and a 400 that sends nothing.
```

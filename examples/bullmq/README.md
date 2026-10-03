# bullmq-example

Built from the [template](https://github.com/rhythmjs/template): its `app.module.ts`, `app.controller.ts`, `app.service.ts`, `main.ts` and tests, plus a typed job queue on [BullMQ](https://docs.bullmq.io) through `@rhythmjs/bullmq`: an email endpoint that enqueues jobs and a worker that processes them.

## What is added to the template

- `bun add @rhythmjs/bullmq`
- `src/emails/queue.ts`: `createQueue(mailService)` builds the typed queue service (`AppJobs` maps `"email.send"` to its payload) and starts a worker on it. `main.ts` assigns it to `appModule.context.queueService` and calls `queueService.close()` on shutdown, which closes the worker first and releases Redis.
- `src/emails/mail.service.ts`: `mailService`, a plain object the worker calls and the controller reads; it records what was "sent".
- `src/emails/emails.controller.ts`: `POST /emails` validates the body and enqueues an `email.send` job (202 with the job id); `GET /emails` lists what the worker processed; `GET /emails/counts` forwards the queue's job counts.
- `src/emails/emails.module.ts`: `emailsModule` assigns `mailService` to its `context`, reads the app's `queueService` and mounts the controller.
- `src/app.module.ts`: `.register(emailsModule)` before the controller.

`REDIS_URL` overrides the default `redis://localhost:6379`. Failed jobs retry three times with exponential backoff (the queue's `defaultJobOptions`).

## Run

```sh
# from the repo root
bun install
docker compose up -d redis

cd examples/bullmq
bun run dev    # http://localhost:3013
```

## Try it

```sh
curl -i -X POST http://localhost:3013/emails -H 'content-type: application/json' -d '{"to":"ada@example.com","subject":"welcome"}'
curl http://localhost:3013/emails           # what the worker has processed
curl http://localhost:3013/emails/counts    # waiting, active, completed, failed, ...
```

## Test

```sh
bun test          # the template's controller spec, plus the emails controller against a stubbed queue
bun run test:e2e  # the template's e2e spec, plus a real Redis (set `REDIS_URL` if it is not on localhost:6379); the queue tests are skipped with a message when none is reachable: a posted email is processed by the worker, a 400 is not queued, and the counts are served.
```

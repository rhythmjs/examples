# ai-sdk-example

Built from the [template](https://github.com/rhythmjs/template): its `app.module.ts`, `app.controller.ts`, `app.service.ts`, `main.ts` and tests, plus a chat endpoint built on the [Vercel AI SDK](https://ai-sdk.dev), where the model is chosen through `@rhythmjs/config`.

## What is added to the template

- `bun add ai @ai-sdk/openai @rhythmjs/config zod`
- `src/config/ai.config.ts`: an `ai` config namespace validated with zod. `AI_MODEL` defaults to `gpt-4o-mini`; an empty value stops the app from booting with a `ConfigError` naming `ai.model`.
- `src/chat/models.ts`: `modelService.create(id)` builds the OpenAI model. It is a plain service, so tests stub it.
- `src/chat/chat.module.ts`: `chatModule` registers the config module, derives the model from the configured id, and mounts `chatController`.
- `src/chat/chat.controller.ts`: `POST /api/chat` streams `result.textStream` straight onto `ctx.response` (no headers to set; read it with `TextStreamChatTransport`), `POST /api/summarize` uses `generateText`, and `GET /api/model` reports the active model. `ctx.request.signal` is the `abortSignal`, so a disconnected client stops the model call.
- `src/app.module.ts`: `.register(chatModule)` before the controller. `src/main.ts` calls `appModule.setup()` first so a bad config fails at startup.

A model endpoint costs money: add authentication, a request size limit and rate limiting before exposing it.

## Run

```sh
# from the repo root
bun install

cd examples/ai-sdk
bun run dev    # http://localhost:3008
```

## Try it

```sh
export OPENAI_API_KEY=sk-...    # Bun loads .env automatically too
curl http://localhost:3008/api/model   # which model is active
curl -N -X POST http://localhost:3008/api/chat -H 'content-type: application/json' \
  -d '{"messages":[{"role":"user","parts":[{"type":"text","text":"Say hello"}]}]}'
AI_MODEL=gpt-4o bun run dev            # swap the model
```

## Test

```sh
bun test          # the template's controller spec
bun run test:e2e  # the template's e2e spec, plus the SDK's mock model (no API key or network): the streamed reply, validation, the summary, model swapping through the environment, and the boot failure.
```

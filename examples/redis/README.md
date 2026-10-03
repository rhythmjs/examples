# redis-example

Built from the [template](https://github.com/rhythmjs/template): its `app.module.ts`, `app.controller.ts`, `app.service.ts`, `main.ts` and tests, plus caching through Bun's built-in `RedisClient`: a cache-aside product lookup.

## What is added to the template

- No new dependency: `RedisClient` is part of Bun.
- `src/redis.ts`: `createRedis()` returns the client. `main.ts` (and the e2e spec) assign it to `appModule.context.redis` and call `redis.close()` on shutdown.
- `src/products/products.module.ts`: `productsModule` receives `redis` from its parent, exposes the products service through its own `context`, and mounts `productsController`.
- `src/products/products.controller.ts`: `GET /products/:id` looks in Redis first (`x-cache: hit` or `miss`), loads from the deliberately slow in-memory service on a miss, stores the JSON with `set` and a 60-second `expire`; `PATCH /products/:id` updates the product and removes the entry with `del`.
- `src/app.module.ts`: `.register(productsModule)` before the controller; `main.ts` closes the Redis client on shutdown.

`REDIS_URL` overrides the default `redis://localhost:6379`.

## Run

```sh
# from the repo root
bun install
docker compose up -d redis

cd examples/redis
bun run dev    # http://localhost:3011
```

## Try it

```sh
curl -i http://localhost:3011/products/1    # x-cache: miss
curl -i http://localhost:3011/products/1    # x-cache: hit
curl -X PATCH http://localhost:3011/products/1 -H 'content-type: application/json' -d '{"price":55}'
```

## Test

```sh
bun test          # the template's controller spec
bun run test:e2e  # the template's e2e spec, plus a real Redis (set `REDIS_URL` if it is not on localhost:6379); the spec is skipped with a message when none is reachable: miss then hit, invalidation on write, a 404 that is not cached, and a 400.
```

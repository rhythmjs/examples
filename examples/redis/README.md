# redis-example

Built from the [template](https://github.com/rhythmjs/template): its `app.module.ts`, `app.controller.ts`, `app.service.ts`, `main.ts` and tests, plus caching through Bun's built-in `RedisClient`: a cache-aside product lookup.

## What is added to the template

- No new dependency: `RedisClient` is part of Bun.
- `src/redis.ts`: `createRedis` / `closeRedis`, a provider with a dispose function.
- `src/products/products.module.ts`: `productsModule` provides the client and the products service and mounts `productsController`.
- `src/products/products.controller.ts`: `GET /products/:id` looks in Redis first (`x-cache: hit` or `miss`), loads from the deliberately slow in-memory service on a miss, stores the JSON with `set` and a 60-second `expire`; `PATCH /products/:id` updates the product and removes the entry with `del`.
- `src/app.module.ts`: `.register(productsModule)` before the controller; closing the app closes the Redis client.

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

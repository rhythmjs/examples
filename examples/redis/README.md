# redis-example

A cache-aside product lookup with Bun's built-in `RedisClient`. No extra dependency.

## How it fits together

- `src/redis/redis.module.ts`: `redisModule` is the infrastructure module. It registers the `redis` client with `decorate` and closes it as the cleanup of `register`. `REDIS_URL` overrides the default `redis://localhost:6379`.
- `src/products/products.module.ts`: `productsModule` is the feature module. It `include`s `redisModule`, provides `productsService` (a deliberately slow in-memory store) with `decorate`, and mounts `productsController` with `mount`.
- `src/products/products.controller.ts`: `GET /products/:id` looks in Redis first (`x-cache: hit` or `miss`), loads from the service on a miss, and stores the JSON with `set` and a 60-second `expire`. `PATCH /products/:id` updates the product and removes the entry with `del`.
- `src/app.module.ts`: includes `redisModule` so `app.stop()` closes the client, adds `appService` with `decorate`, and mounts `appController` and `productsModule`.
- `src/main.ts`: `Bun.serve({ fetch: toFetchHandler(appModule) })`, and `appModule.stop()` on shutdown.

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
bun test          # controller spec
bun run test:e2e  # app spec, plus the cache tests against a real Redis (REDIS_URL if not on localhost:6379); those are skipped with a message when none is reachable
```

# scalar-example

A [Scalar](https API reference page over the OpenAPI document that `@rhythmjs/openapi` generates for the app's routes.

## How it fits together

- `src/app.controller.ts`: the router is wrapped with `documented(...)`, and `GET /` describes itself with `apiOperation` and `apiResponse`, which are ordinary middleware. Routers that are not wrapped are not documented.
- `src/app.module.ts`: `.use(mount(openapiModule.forRoot({ document })))` serves the document at `/openapi.json`, and `.use(mount(scalarModule.forRoot()))` serves the page at `/docs`. Both are plain routers mounted in the app; `openapiModule` documents everything mounted in the same app.
- `src/main.ts`: `Bun.serve({ fetch: toFetchHandler(appModule) })`.

The page loads from a CDN (`//scalar.com):cdn.jsdelivr.net`), so the browser needs network access. `path` and `url` on `scalarModule.forRoot` move the page and point it at another spec URL.

## Run

```sh
# from the repo root
bun install

cd examples/scalar
bun run dev    # http://localhost:3005
```

## Try it

```sh
open http://localhost:3005/docs          # the API reference
curl http://localhost:3005/openapi.json  # the generated document
```

## Test

```sh
bun test          # controller spec
bun run test:e2e  # the whole app: the document describes `GET /` and the docs page points at it
```

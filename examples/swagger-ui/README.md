# swagger-ui-example

A [Swagger UI](https API reference page over the OpenAPI document that `@rhythmjs/openapi` generates for the app's routes. This is the [Scalar example](../scalar) with the other UI.

## How it fits together

- `src/app.controller.ts`: the router is wrapped with `documented(...)`, and `GET /` describes itself with `apiOperation` and `apiResponse`, which are ordinary middleware. Routers that are not wrapped are not documented.
- `src/app.module.ts`: `.use(mount(openapiModule.forRoot({ document })))` serves the document at `/openapi.json`, and `.use(mount(swaggerModule.forRoot()))` serves the page at `/docs`. Both are plain routers mounted in the app; `openapiModule` documents everything mounted in the same app.
- `src/main.ts`: `Bun.serve({ fetch: toFetchHandler(appModule) })`.

The page loads from a CDN (`//swagger.io/tools/swagger-ui/):unpkg.com`), so the browser needs network access. `path` and `url` on `swaggerModule.forRoot` move the page and point it at another spec URL.

## Run

```sh
# from the repo root
bun install

cd examples/swagger-ui
bun run dev    # http://localhost:3006
```

## Try it

```sh
open http://localhost:3006/docs          # the API reference
curl http://localhost:3006/openapi.json  # the generated document
```

## Test

```sh
bun test          # controller spec
bun run test:e2e  # the whole app: the document describes `GET /` and the docs page points at it
```

# scalar-example

Built from the [template](https://github.com/rhythmjs/template): its `app.module.ts`, `app.controller.ts`, `app.service.ts`, `main.ts` and tests, plus a [Scalar](https://scalar.com) API reference over the OpenAPI document that `@rhythmjs/openapi` generates for its routes.

## What is added to the template

- `bun add @rhythmjs/openapi @rhythmjs/scalar @rhythmjs/http`
- `src/app.controller.ts`: `GET /` carries its own documentation with `apiOperation` and `apiResponse`, which are ordinary middleware, so the router stays the single source of truth.
- `src/app.module.ts`: `openapiModule.forRoot` finds the router on its own and serves only the document, at `/openapi.json`. `scalarModule.forRoot()` is a separate module that serves the Scalar page at `/docs`, loading that document. Both are registered before the controller.

Scalar loads from a CDN (`cdn.jsdelivr.net`), so the browser needs network access to render the page. `path` and `url` on `scalarModule.forRoot` move the page and point it at another spec URL.

## Run

```sh
# from the repo root
bun install

cd examples/scalar
bun run dev    # http://localhost:3005
```

## Try it

```sh
open http://localhost:3005/docs          # the Scalar reference
curl http://localhost:3005/openapi.json  # the generated document
```

## Test

```sh
bun test          # the template's controller spec
bun run test:e2e  # the template's e2e spec, plus the document describes `GET /` and the Scalar page points at it.
```

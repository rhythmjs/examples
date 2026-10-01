# swagger-ui-example

Built from the [template](https://github.com/rhythmjs/template): its `app.module.ts`, `app.controller.ts`, `app.service.ts`, `main.ts` and tests, plus a [Swagger UI](https://swagger.io/tools/swagger-ui/) reference page: the [Scalar example](../scalar) with the other UI.

## What is added to the template

- `bun add @rhythmjs/openapi @rhythmjs/swagger @rhythmjs/http`
- `src/app.controller.ts`: `GET /` is described with `apiOperation` and `apiResponse`.
- `src/app.module.ts`: `openapiModule.forRoot` serves only the document, at `/openapi.json`; `swaggerModule.forRoot()` serves the Swagger UI page at `/docs`, loading it.

Swagger UI loads from a CDN (`unpkg.com`, with subresource integrity), so the browser needs network access. `path` and `url` on `swaggerModule.forRoot` move the page and point it at another spec URL.

## Run

```sh
# from the repo root
bun install

cd examples/swagger-ui
bun run dev    # http://localhost:3006
```

## Try it

```sh
open http://localhost:3006/docs          # Swagger UI
curl http://localhost:3006/openapi.json  # the generated document
```

## Test

```sh
bun test          # the template's controller spec
bun run test:e2e  # the template's e2e spec, plus the document and the Swagger UI page.
```

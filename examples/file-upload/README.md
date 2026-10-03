# file-upload-example

Built from the [template](https://github.com/rhythmjs/template): its `app.module.ts`, `app.controller.ts`, `app.service.ts`, `main.ts` and tests, plus file uploads through `@rhythmjs/http`'s `multipart` middleware, stored on disk and in S3-compatible storage.

## What is added to the template

- `bun add @rhythmjs/http`
- `src/storage.ts`: `createStorage()` builds Bun's `S3Client` once; `main.ts` assigns it to `appModule.context.s3`. Defaults match the MinIO service in `compose.yaml` (`S3_ENDPOINT`, `S3_BUCKET`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY` override them; the bucket `uploads` is created with the container).
- `src/app.controller.ts`: `multipart({ maxBytes, maxFileSize, maxFiles })` parses the form into `ctx.form` and aborts mid-stream when a limit is crossed. `POST /avatar` checks the file's type and writes it to `uploads/` under a generated name with `Bun.write` (`UPLOAD_DIR` changes the folder); `GET /avatar/:key` serves it back, matching the key against a strict pattern so no path can escape the folder; `POST /documents` writes to S3 and returns a presigned URL.
- `src/app.module.ts`: `s3` is declared on the module's context (`Rhythm<RhythmHttpContext, { appService; s3 }>`).

## Run

```sh
# from the repo root
bun install
docker compose up -d minio   # only for the S3 route

cd examples/file-upload
bun run dev    # http://localhost:3012
```

## Try it

```sh
curl -F avatar=@me.png http://localhost:3012/avatar
curl -F document=@notes.txt http://localhost:3012/documents
```

## Test

```sh
bun test          # the template's controller spec
bun run test:e2e  # the template's e2e spec, plus a temporary folder for the disk route (success, missing field, 415, 413, path traversal) and, when MinIO is reachable, an upload that is downloaded through the presigned URL.
```

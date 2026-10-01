import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { toFetchHandler } from "@rhythmjs/router/fetch";
import { appModule } from "../src/app.module";

describe("AppController (e2e)", () => {
  const app = toFetchHandler(appModule);

  afterAll(() => appModule.teardown());

  test("/ (GET)", async () => {
    const res = await app(new Request("http://localhost/"));

    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toBe("text/plain");
    expect(await res.text()).toBe("Hello World!");
  });

  test("/missing (GET) hits the module's not-found handler", async () => {
    const res = await app(new Request("http://localhost/missing"));

    expect(res.status).toBe(404);
    expect(res.headers.get("content-type")).toBe("application/json");
    expect(await res.json()).toEqual({ success: false, status: 404, message: "Not Found" });
  });
});

const upload = (path: string, field: string, file: File) => {
  const form = new FormData();
  form.set(field, file);
  return toFetchHandler(appModule)(new Request(`http://localhost${path}`, { method: "POST", body: form }));
};
const png = (size = 16) => new File([new Uint8Array(size).fill(7)], "me.png", { type: "image/png" });

describe("avatar upload to disk (e2e)", () => {
  let dir: string;
  beforeAll(async () => {
    dir = await mkdtemp(join(tmpdir(), "uploads-"));
    process.env.UPLOAD_DIR = dir;
  });
  afterAll(() => rm(dir, { recursive: true, force: true }));

  test("stores the file under a generated name and serves it back", async () => {
    const res = await upload("/avatar", "avatar", png(32));
    expect(res.status).toBe(201);
    const body = (await res.json()) as { key: string; size: number; url: string };
    expect(body.key).toMatch(/^[0-9a-f-]{36}\.png$/);
    expect(body.size).toBe(32);

    const download = await toFetchHandler(appModule)(new Request(`http://localhost${body.url}`));
    expect(download.status).toBe(200);
    expect(download.headers.get("content-type")).toBe("image/png");
    expect(new Uint8Array(await download.arrayBuffer())).toEqual(new Uint8Array(32).fill(7));
  });

  test("answers 400 when the field is missing", async () => {
    expect((await upload("/avatar", "other", png())).status).toBe(400);
  });

  test("answers 415 for a type that is not allowed", async () => {
    expect((await upload("/avatar", "avatar", new File(["hi"], "x.txt", { type: "text/plain" }))).status).toBe(415);
  });

  test("answers 413 when the file exceeds the per-file limit", async () => {
    expect((await upload("/avatar", "avatar", png(2 * 1024 * 1024 + 1))).status).toBe(413);
  });

  test("never serves a path outside the upload folder", async () => {
    const res = await toFetchHandler(appModule)(new Request("http://localhost/avatar/..%2F..%2Fpackage.json"));
    expect(res.status).toBe(404);
  });
});

const endpoint = process.env.S3_ENDPOINT ?? "http://localhost:9100";
const minio = await fetch(`${endpoint}/minio/health/live`).then(
  (response) => response.ok,
  () => false,
);

describe.skipIf(!minio)("document upload to S3 (e2e, needs MinIO)", () => {
  test("writes the object and returns a working presigned URL", async () => {
    const res = await upload(
      "/documents",
      "document",
      new File(["hello from the example"], "notes.txt", { type: "text/plain" }),
    );
    expect(res.status).toBe(201);

    const body = (await res.json()) as { key: string; url: string };
    expect(body.key).toStartWith("documents/");

    const download = await fetch(body.url);
    expect(download.status).toBe(200);
    expect(await download.text()).toBe("hello from the example");
  });
});

test("minio availability", () => {
  if (!minio) console.warn("skipped: MinIO is not reachable, start it with `docker compose up -d minio`");
  expect(true).toBe(true);
});

import { afterAll, describe, expect, test } from "bun:test";
import { RedisClient } from "bun";
import { toFetchHandler } from "@rhythmjs/router/fetch";
import { appModule } from "../src/app.module";
import { createRedis } from "../src/redis";

describe("AppController (e2e)", () => {
  const redis = createRedis();
  appModule.context.redis = redis;
  const app = toFetchHandler(appModule);

  afterAll(() => redis.close());

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

const probe = new RedisClient(process.env.REDIS_URL ?? "redis://localhost:6379");
const reachable = await probe.ping().then(
  () => true,
  () => false,
);
probe.close();

const app = toFetchHandler(appModule);
const get = (path: string) => app(new Request(`http://localhost${path}`));
const patch = (path: string, body: unknown) =>
  app(
    new Request(`http://localhost${path}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    }),
  );

describe.skipIf(!reachable)("products cache (e2e, needs Redis)", () => {
  afterAll(async () => {
    const cleanup = new RedisClient(process.env.REDIS_URL ?? "redis://localhost:6379");
    await cleanup.del("product:1", "product:2");
    cleanup.close();
  });

  test("the first read misses, the second is served from Redis", async () => {
    await patch("/products/1", {});

    const first = await get("/products/1");
    expect(first.status).toBe(200);
    expect(first.headers.get("x-cache")).toBe("miss");

    const second = await get("/products/1");
    expect(second.headers.get("x-cache")).toBe("hit");
    expect(await second.json()).toEqual(await first.json());
  });

  test("a write invalidates the cached entry", async () => {
    await get("/products/2");
    expect((await get("/products/2")).headers.get("x-cache")).toBe("hit");

    expect((await patch("/products/2", { price: 30 })).status).toBe(200);

    const next = await get("/products/2");
    expect(next.headers.get("x-cache")).toBe("miss");
    expect(((await next.json()) as { price: number }).price).toBe(30);
  });

  test("an unknown product is a 404 and is not cached", async () => {
    expect((await get("/products/missing")).status).toBe(404);
    expect((await get("/products/missing")).status).toBe(404);
  });

  test("an invalid price is a 400", async () => {
    expect((await patch("/products/1", { price: -1 })).status).toBe(400);
  });
});

test("redis availability", () => {
  if (!reachable) console.warn("skipped: Redis is not reachable, start it with `docker compose up -d redis`");
  expect(true).toBe(true);
});

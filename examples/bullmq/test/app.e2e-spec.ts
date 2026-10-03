import { afterAll, describe, expect, test } from "bun:test";
import { RedisClient } from "bun";
import { toFetchHandler } from "@rhythmjs/router/fetch";
import { appModule } from "../src/app.module";
import { mailService } from "../src/emails/mail.service";
import { createQueue } from "../src/emails/queue";

describe("AppController (e2e)", () => {
  test("/ (GET)", async () => {
    const res = await app(new Request("http://localhost/"));

    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toBe("text/plain; charset=utf-8");
    expect(await res.text()).toBe("Hello World!");
  });

  test("/missing (GET) hits the module's not-found handler", async () => {
    const res = await app(new Request("http://localhost/missing"));

    expect(res.status).toBe(404);
    expect(res.headers.get("content-type")).toBe("application/json; charset=utf-8");
    expect(await res.json()).toEqual({ success: false, status: 404, message: "Not Found" });
  });
});

const probe = new RedisClient(process.env.REDIS_URL ?? "redis://localhost:6379");
const reachable = await probe.ping().then(
  () => true,
  () => false,
);
probe.close();

const queueService = reachable ? createQueue(mailService) : undefined;
if (queueService) appModule.context.queueService = queueService;
afterAll(() => queueService?.close());

const app = toFetchHandler(appModule);
const send = (body: unknown) =>
  app(
    new Request("http://localhost/emails", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    }),
  );

async function waitForSent(subject: string) {
  const deadline = Date.now() + 5000;
  while (Date.now() < deadline) {
    const { sent } = (await (await app(new Request("http://localhost/emails"))).json()) as {
      sent: { subject: string }[];
    };
    if (sent.some((mail) => mail.subject === subject)) return true;
    await new Promise((resolve) => setTimeout(resolve, 50));
  }
  return false;
}

describe.skipIf(!reachable)("email queue (e2e, needs Redis)", () => {
  test("a posted email becomes a job that the worker processes", async () => {
    const subject = `welcome-${crypto.randomUUID()}`;

    const res = await send({ to: "ada@example.com", subject });

    expect(res.status).toBe(202);
    expect(((await res.json()) as { id: string }).id).toBeTruthy();
    expect(await waitForSent(subject)).toBe(true);
  });

  test("an invalid email is a 400 and is not queued", async () => {
    expect((await send({ to: "nope", subject: "x" })).status).toBe(400);
  });

  test("the queue's job counts are served", async () => {
    const counts = (await (await app(new Request("http://localhost/emails/counts"))).json()) as Record<string, number>;

    expect(typeof counts.waiting).toBe("number");
    expect(typeof counts.failed).toBe("number");
  });
});

test("redis availability", () => {
  if (!reachable) console.warn("skipped: Redis is not reachable, start it with `docker compose up -d redis`");
  expect(true).toBe(true);
});

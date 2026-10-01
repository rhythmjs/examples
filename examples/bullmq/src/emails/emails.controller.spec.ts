import { describe, expect, test } from "bun:test";
import type { QueueService } from "@rhythmjs/bullmq";
import { runHttpMiddleware } from "@rhythmjs/testing/router";
import { emailsController } from "./emails.controller";
import { mailService } from "./mail.service";
import type { AppJobs } from "./queue";

function stubQueue() {
  const added: { name: string; payload: unknown }[] = [];
  const queueService = {
    add: async (name: string, payload: unknown) => {
      added.push({ name, payload });
      return "42";
    },
    counts: async () => ({ waiting: 1, active: 0 }),
  } as unknown as QueueService<AppJobs>;
  return { queueService, added };
}

const post = (body: unknown, queueService: QueueService<AppJobs>) =>
  runHttpMiddleware(
    emailsController.middleware(),
    new Request("http://localhost/emails", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    }),
    { queueService, mailService },
  );

describe("emailsController", () => {
  test("POST /emails enqueues an email.send job and answers 202 with the job id", async () => {
    const { queueService, added } = stubQueue();

    const { response } = await post({ to: "ada@example.com", subject: "hi" }, queueService);

    expect(response.status).toBe(202);
    expect(await response.json()).toEqual({ id: "42" });
    expect(added).toEqual([{ name: "email.send", payload: { to: "ada@example.com", subject: "hi" } }]);
  });

  test("POST /emails rejects a missing address or subject with 400 and enqueues nothing", async () => {
    const { queueService, added } = stubQueue();

    expect((await post({ subject: "hi" }, queueService)).response.status).toBe(400);
    expect((await post({ to: "not-an-address", subject: "hi" }, queueService)).response.status).toBe(400);
    expect((await post({ to: "ada@example.com" }, queueService)).response.status).toBe(400);
    expect(added).toEqual([]);
  });

  test("GET /emails/counts forwards the queue's job counts", async () => {
    const { queueService } = stubQueue();

    const { response } = await runHttpMiddleware(emailsController.middleware(), "/emails/counts", {
      queueService,
      mailService,
    });

    expect(await response.json()).toEqual({ waiting: 1, active: 0 });
  });
});

import { describe, expect, test } from "bun:test";
import { runHttpMiddleware } from "@rhythmjs/testing/router";
import { appController } from "./app.controller";
import { appService } from "./app.service";
import type { mailService } from "./mail/mail.service";

const okMailer = {
  send: async () => ({ data: { id: "email_123" }, error: null }),
} as unknown as typeof mailService;

const run = (path: string, service: typeof appService = appService) =>
  runHttpMiddleware(appController.middleware(), path, { appService: service, mailService: okMailer });

describe("AppController", () => {
  test("GET / responds 200 with the service greeting", async () => {
    const { response } = await run("/");

    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toBe("text/plain; charset=utf-8");
    expect(await response.text()).toBe("Hello World!");
  });

  test("delegates to the provided app service", async () => {
    const stub: typeof appService = { getHello: () => "Hello from the stub!" };

    const { response } = await run("/", stub);

    expect(await response.text()).toBe("Hello from the stub!");
  });

  test("passes unmatched routes through to the next middleware", async () => {
    const { nextCalled, response } = await run("/missing");

    expect(nextCalled).toBe(true);
    expect(await response.text()).toBe("");
  });

  test("POST /contact answers 202 with the email id", async () => {
    const request = new Request("http://localhost/contact", {
      method: "POST",
      body: JSON.stringify({ email: "ada@example.com", message: "Hi" }),
    });
    const { response } = await runHttpMiddleware(appController.middleware(), request, {
      appService,
      mailService: okMailer,
    });

    expect(response.status).toBe(202);
    expect(await response.json()).toEqual({ id: "email_123" });
  });
});

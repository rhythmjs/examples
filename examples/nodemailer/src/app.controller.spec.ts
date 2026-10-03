import { describe, expect, test } from "bun:test";
import { runHttpMiddleware } from "@rhythmjs/testing/router";
import { appController } from "./app.controller";
import { appService } from "./app.service";
import type { Mailer } from "./mail/mail";

const sent: string[] = [];
const mailer = {
  sendWelcome: async (to: string) => {
    sent.push(to);
    return { messageId: "id-1" };
  },
} as unknown as Mailer;

const run = (path: string, service: typeof appService = appService) =>
  runHttpMiddleware(appController.middleware(), path, { appService: service, mailer });

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

  test("POST /signup sends the welcome mail through the mailer", async () => {
    const request = new Request("http://localhost/signup", {
      method: "POST",
      body: JSON.stringify({ name: "Ada", email: "ada@example.com" }),
    });
    const { response } = await runHttpMiddleware(appController.middleware(), request, { appService, mailer });

    expect(response.status).toBe(201);
    expect(sent).toContain("ada@example.com");
  });
});

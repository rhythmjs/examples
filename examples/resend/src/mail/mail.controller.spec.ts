import { describe, expect, test } from "bun:test";
import { mount } from "@rhythmjs/rhythm";
import { runHttpMiddleware } from "@rhythmjs/testing/router";
import { mailController } from "./mail.controller";
import type { mailService } from "./mail.service";

const okMailer = {
  send: async () => ({ data: { id: "email_123" }, error: null }),
} as unknown as typeof mailService;

describe("mailController", () => {
  test("POST /contact answers 202 with the email id", async () => {
    const request = new Request("http://localhost/contact", {
      method: "POST",
      body: JSON.stringify({ email: "ada@example.com", message: "Hi" }),
    });
    const { response } = await runHttpMiddleware(mount(mailController), request, { mailService: okMailer });

    expect(response.status).toBe(202);
    expect(await response.json()).toEqual({ id: "email_123" });
  });

  test("POST /contact rejects an invalid email", async () => {
    const request = new Request("http://localhost/contact", {
      method: "POST",
      body: JSON.stringify({ email: "nope", message: "Hi" }),
    });
    const { response } = await runHttpMiddleware(mount(mailController), request, { mailService: okMailer });

    expect(response.status).toBe(400);
  });
});

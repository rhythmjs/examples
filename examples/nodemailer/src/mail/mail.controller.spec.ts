import { describe, expect, test } from "bun:test";
import { mount } from "@rhythmjs/rhythm";
import { runHttpMiddleware } from "@rhythmjs/testing/router";
import { mailController } from "./mail.controller";
import type { MailService } from "./mail.service";

const sent: string[] = [];
const mailService = {
  sendWelcome: async (to: string) => {
    sent.push(to);
    return { messageId: "id-1" };
  },
} as unknown as MailService;

const signup = (body: unknown) =>
  runHttpMiddleware(
    mount(mailController),
    new Request("http://localhost/signup", { method: "POST", body: JSON.stringify(body) }),
    {
      mailService,
    },
  );

describe("mailController", () => {
  test("POST /signup sends the welcome mail through the mail service", async () => {
    const { response } = await signup({ name: "Ada", email: "ada@example.com" });

    expect(response.status).toBe(201);
    expect(sent).toContain("ada@example.com");
  });

  test("POST /signup rejects an invalid address", async () => {
    const { response } = await signup({ name: "Ada", email: "nope" });

    expect(response.status).toBe(400);
  });
});

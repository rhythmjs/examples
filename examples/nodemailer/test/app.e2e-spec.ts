import { afterAll, describe, expect, test } from "bun:test";
import { toFetchHandler } from "@rhythmjs/router/fetch";
import { appModule } from "../src/app.module";
import { createMailer } from "../src/mail/mail";

describe("AppController (e2e)", () => {
  const { mailer, close } = createMailer();
  appModule.context.mailer = mailer;
  const app = toFetchHandler(appModule);

  afterAll(close);

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

  test("/signup (POST) builds the welcome mail with the JSON transport", async () => {
    const res = await app(
      new Request("http://localhost/signup", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name: "Ada", email: "ada@example.com" }),
      }),
    );

    expect(res.status).toBe(201);
    expect(((await res.json()) as { messageId: string }).messageId).toBeTruthy();
  });

  test("/signup (POST) rejects an invalid address before any mail is built", async () => {
    const res = await app(
      new Request("http://localhost/signup", { method: "POST", body: JSON.stringify({ name: "Ada", email: "nope" }) }),
    );

    expect(res.status).toBe(400);
  });
});

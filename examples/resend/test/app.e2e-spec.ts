import { afterAll, afterEach, describe, expect, mock, spyOn, test } from "bun:test";
import { toFetchHandler } from "@rhythmjs/router/fetch";
import { appModule } from "../src/app.module";
import { mailService } from "../src/mail/mail.service";

type Sent = { to: string; subject: string; html: string };
type SendResult = Awaited<ReturnType<typeof mailService.send>>;

function stubSend(result: "ok" | "error") {
  const sent: Sent[] = [];
  spyOn(mailService, "send").mockImplementation(async (to, subject, html) => {
    sent.push({ to, subject, html });
    return (
      result === "ok"
        ? { data: { id: "email_123" }, error: null, headers: null }
        : { data: null, error: { name: "validation_error", message: "bad" }, headers: null }
    ) as SendResult;
  });
  return sent;
}

const app = toFetchHandler(appModule);

const contact = (body: unknown) =>
  app(
    new Request("http://localhost/contact", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    }),
  );

describe("AppController (e2e)", () => {
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

describe("/contact (e2e)", () => {
  afterEach(() => mock.restore());

  test("sends the email and answers 202 with its id", async () => {
    const sent = stubSend("ok");
    const res = await contact({ email: "ada@example.com", message: "Hi" });

    expect(res.status).toBe(202);
    expect(await res.json()).toEqual({ id: "email_123" });
    expect(sent[0]?.to).toBe("ada@example.com");
    expect(sent[0]?.html).toBe("<p>Hi</p>");
  });

  test("escapes user input before it reaches the HTML", async () => {
    const sent = stubSend("ok");
    await contact({ email: "ada@example.com", message: "<script>x</script>" });

    expect(sent[0]?.html).not.toContain("<script>");
  });

  test("an API error from Resend becomes a 502, not a success", async () => {
    stubSend("error");

    expect((await contact({ email: "ada@example.com", message: "Hi" })).status).toBe(502);
  });

  test("an invalid body is a 400 and sends nothing", async () => {
    const sent = stubSend("ok");
    const res = await contact({ email: "nope", message: "" });

    expect(res.status).toBe(400);
    expect(sent).toHaveLength(0);
  });
});

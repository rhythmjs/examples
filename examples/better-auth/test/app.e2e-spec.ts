import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { toFetchHandler } from "@rhythmjs/router/fetch";

process.env.AUTH_DB = ":memory:";
const { appModule } = await import("../src/app.module");
const { migrate } = await import("../src/lib/migrate");

const frontend = "http://localhost:3001";
const origin = "http://localhost:3007";

describe("AppController (e2e)", () => {
  const app = toFetchHandler(appModule);
  const json = (path: string, body: unknown, headers: Record<string, string> = {}) =>
    app(
      new Request(`http://localhost${path}`, {
        method: "POST",
        headers: { "content-type": "application/json", origin, ...headers },
        body: JSON.stringify(body),
      }),
    );
  const get = (path: string, headers: Record<string, string> = {}) =>
    app(new Request(`http://localhost${path}`, { headers }));

  beforeAll(migrate);
  afterAll(() => appModule.teardown());

  test("/ (GET)", async () => {
    const res = await get("/");

    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toBe("text/plain");
    expect(await res.text()).toBe("Hello World!");
  });

  test("/missing (GET) hits the module's not-found handler", async () => {
    const res = await get("/missing");

    expect(res.status).toBe(404);
    expect(await res.json()).toEqual({ success: false, status: 404, message: "Not Found" });
  });

  test("/me (GET) is 401 without a session", async () => {
    expect((await get("/me")).status).toBe(401);
  });

  test("sign up, then the session cookie unlocks /me", async () => {
    const signUp = await json("/api/auth/sign-up/email", {
      name: "Ada",
      email: "ada@example.com",
      password: "correct-horse-battery",
    });
    expect(signUp.status).toBe(200);

    const cookie = signUp.headers
      .getSetCookie()
      .map((entry) => entry.split(";")[0])
      .join("; ");
    expect(cookie).toContain("better-auth.session_token");

    const me = await get("/me", { cookie });
    expect(me.status).toBe(200);
    expect(await me.json()).toMatchObject({
      name: "Ada",
      email: "ada@example.com",
      sessionExpiresAt: expect.any(String),
    });
  });

  test("a wrong password is rejected", async () => {
    const res = await json("/api/auth/sign-in/email", { email: "ada@example.com", password: "wrong-password!" });

    expect(res.status).toBeGreaterThanOrEqual(400);
  });

  test("a preflight is answered for the frontend origin", async () => {
    const res = await app(
      new Request("http://localhost/api/auth/sign-in/email", {
        method: "OPTIONS",
        headers: { origin: frontend, "access-control-request-method": "POST" },
      }),
    );

    expect(res.status).toBe(204);
    expect(res.headers.get("access-control-allow-origin")).toBe(frontend);
    expect(res.headers.get("access-control-allow-credentials")).toBe("true");
  });

  test("Better Auth's responses carry the CORS headers next to its cookies", async () => {
    const res = await json(
      "/api/auth/sign-up/email",
      { name: "Grace", email: "grace@example.com", password: "correct-horse-battery" },
      { origin: frontend },
    );

    expect(res.headers.get("access-control-allow-origin")).toBe(frontend);
    expect(res.headers.getSetCookie().join(";")).toContain("better-auth.session_token");
  });

  test("another origin is not allowed", async () => {
    const res = await get("/", { origin: "http://evil.example" });

    expect(res.headers.get("access-control-allow-origin")).toBeNull();
  });
});

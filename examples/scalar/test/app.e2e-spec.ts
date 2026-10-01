import { afterAll, describe, expect, test } from "bun:test";
import { toFetchHandler } from "@rhythmjs/router/fetch";
import { appModule } from "../src/app.module";

describe("AppController (e2e)", () => {
  const app = toFetchHandler(appModule);

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

  test("/openapi.json (GET) describes the route", async () => {
    const res = await app(new Request("http://localhost/openapi.json"));

    expect(res.status).toBe(200);
    const document = (await res.json()) as { openapi: string; paths: Record<string, { get: { operationId: string } }> };
    expect(document.openapi).toStartWith("3.1");
    expect(document.paths["/"]?.get.operationId).toBe("getHello");
  });

  test("/docs (GET) serves the Scalar page for that document", async () => {
    const res = await app(new Request("http://localhost/docs"));

    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toContain("text/html");
    const html = await res.text();
    expect(html).toContain("@scalar/api-reference");
    expect(html).toContain("/openapi.yaml");
  });

  test("/openapi.yaml (GET) serves the same document as YAML", async () => {
    const res = await app(new Request("http://localhost/openapi.yaml"));

    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toContain("application/yaml");
    const text = await res.text();
    expect(text).toContain("openapi: 3.1.2");
    const json = await (await app(new Request("http://localhost/openapi.json"))).json();
    expect(Bun.YAML.parse(text)).toEqual(json as never);
  });

  test("/docs (GET) loads the YAML document and applies Scalar's theme", async () => {
    const html = await (await app(new Request("http://localhost/docs"))).text();

    expect(html).toContain('data-url="/openapi.yaml"');
    expect(html).toContain("&quot;theme&quot;:&quot;purple&quot;");
  });
});

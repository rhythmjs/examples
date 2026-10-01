import { describe, expect, test } from "bun:test";
import { runHttpMiddleware } from "@rhythmjs/testing/router";
import { appController } from "./app.controller";
import { appService } from "./app.service";

const run = (path: string, service: typeof appService = appService) =>
  runHttpMiddleware(appController.middleware(), path, { appService: service, s3: {} as never });

describe("AppController", () => {
  test("GET / responds 200 with the service greeting", async () => {
    const { response } = await run("/");

    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toBe("text/plain");
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
});

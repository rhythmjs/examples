import { describe, expect, test } from "bun:test";
import { ConfigError } from "@rhythmjs/config";
import { Rhythm, decorate, include, mount } from "@rhythmjs/rhythm";
import { toFetchHandler } from "@rhythmjs/router/fetch";
import { simulateReadableStream } from "ai";
import { MockLanguageModelV4 } from "ai/test";
import { appModule } from "../src/app.module";
import { modelModule } from "../src/ai/model.module";
import { chatController } from "../src/chat/chat.controller";
import { aiConfig } from "../src/config/ai.config";

describe("AppController (e2e)", () => {
  const app = toFetchHandler(appModule);

  test("/ (GET)", async () => {
    const res = await app(new Request("http://localhost/"));

    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toBe("text/plain; charset=utf-8");
    expect(await res.text()).toBe("Hello World!");
  });

  test("/missing (GET) falls through to the default 404", async () => {
    const res = await app(new Request("http://localhost/missing"));

    expect(res.status).toBe(404);
    expect(await res.text()).toBe("Not Found");
  });
});

const usage = {
  inputTokens: { total: 3, noCache: 3, cacheRead: undefined, cacheWrite: undefined },
  outputTokens: { total: 5, text: 5, reasoning: undefined },
};

function mockModel(words: string[]) {
  return new MockLanguageModelV4({
    doGenerate: async () => ({
      content: [{ type: "text", text: words.join("") }],
      finishReason: { unified: "stop", raw: "stop" },
      usage,
      warnings: [],
    }),
    doStream: async () => ({
      stream: simulateReadableStream({
        chunks: [
          { type: "text-start", id: "t1" },
          ...words.map((delta) => ({ type: "text-delta" as const, id: "t1", delta })),
          { type: "text-end", id: "t1" },
          { type: "finish", finishReason: { unified: "stop", raw: "stop" }, usage },
        ],
      }),
    }),
  });
}

// The chat controller on its own, with the mock model in place of the configured one.
const chatApp = (model: MockLanguageModelV4) =>
  toFetchHandler(
    new Rhythm().register(decorate(() => ({ model, modelInfo: { id: "mock" } }))).use(mount(chatController)),
  );

const post = (app: (request: Request) => Response | Promise<Response>, path: string, body: unknown) =>
  app(
    new Request(`http://localhost${path}`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    }),
  );

const userMessage = { id: "m1", role: "user", parts: [{ type: "text", text: "Say hello" }] };

describe("chat module (e2e)", () => {
  test("/api/chat (POST) streams the model's reply as plain text", async () => {
    const model = mockModel(["Hello", ", ", "world"]);
    const res = await post(chatApp(model), "/api/chat", { messages: [userMessage] });

    expect(res.status).toBe(200);
    expect(await res.text()).toBe("Hello, world");
    expect(model.doStreamCalls).toHaveLength(1);
  });

  test("/api/chat (POST) rejects a body without messages", async () => {
    const res = await post(chatApp(mockModel(["x"])), "/api/chat", { messages: [] });

    expect(res.status).toBe(400);
  });

  test("/api/summarize (POST) answers with the complete text", async () => {
    const res = await post(chatApp(mockModel(["A short summary."])), "/api/summarize", {
      text: "A long text about Rhythm.",
    });

    expect(await res.json()).toEqual({ summary: "A short summary." });
  });
});

const withEnv = async (env: Record<string, string | undefined>, run: () => Promise<void>) => {
  const saved = Object.fromEntries(Object.keys(env).map((key) => [key, process.env[key]]));
  for (const [key, value] of Object.entries(env)) {
    if (value === undefined) delete process.env[key];
    else process.env[key] = value;
  }
  try {
    await run();
  } finally {
    for (const [key, value] of Object.entries(saved)) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  }
};

// The config loads when modelModule is evaluated, so each case imports a fresh copy of it.
let copy = 0;
const importModelModule = async () => {
  const specifier = "../src/ai/model.module";
  return (await import(`${specifier}?copy=${++copy}`)) as { modelModule: typeof modelModule };
};

describe("model swapping through @rhythmjs/config", () => {
  const modelInfo = async (env: Record<string, string | undefined>) => {
    let info: unknown;
    await withEnv(env, async () => {
      const { modelModule: fresh } = await importModelModule();
      const app = toFetchHandler(
        new Rhythm()
          .register(include(fresh, ({ model, modelInfo }) => ({ model, modelInfo })))
          .use(mount(chatController)),
      );
      info = await (await app(new Request("http://localhost/api/model"))).json();
    });
    return info;
  };

  test("defaults to gpt-4o-mini", async () => {
    expect(await modelInfo({ AI_MODEL: undefined })).toEqual({ id: "gpt-4o-mini" });
  });

  test("AI_MODEL swaps the model without a code change", async () => {
    expect(await modelInfo({ AI_MODEL: "gpt-4o" })).toEqual({ id: "gpt-4o" });
  });

  test("an invalid value stops the app from booting, with the path in the error", async () => {
    await withEnv({ AI_MODEL: "" }, async () => {
      await expect(importModelModule()).rejects.toBeInstanceOf(ConfigError);
      await expect(aiConfig()).rejects.toThrow("ai.model");
    });
  });
});

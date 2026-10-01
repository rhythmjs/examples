import { RhythmRouter } from "@rhythmjs/router";
import type { RhythmHttpContext } from "@rhythmjs/router/adapters/context";
import { convertToModelMessages, generateText, streamText, type UIMessage } from "ai";
import type { ChatModel } from "./models";

export type ChatContext = RhythmHttpContext & ChatModel;

export const chatController = new RhythmRouter<ChatContext>({ prefix: "/api" })
  .get("/model", (ctx) => {
    ctx.json(ctx.modelInfo);
  })
  .post("/chat", async (ctx) => {
    const { messages } = (await ctx.request.json()) as { messages?: UIMessage[] };
    if (!Array.isArray(messages) || messages.length === 0) {
      ctx.error(400, "messages are required");
      return;
    }

    const result = streamText({
      model: ctx.model,
      system: "You are a concise assistant.",
      messages: await convertToModelMessages(messages),
      abortSignal: ctx.request.signal,
    });

    ctx.response.body = result.textStream.pipeThrough(new TextEncoderStream());
  })
  .post("/summarize", async (ctx) => {
    const { text } = (await ctx.request.json()) as { text?: string };
    if (!text) {
      ctx.error(400, "text is required");
      return;
    }

    const result = await generateText({
      model: ctx.model,
      prompt: `Summarize in one sentence: ${text}`,
      abortSignal: ctx.request.signal,
    });

    ctx.json({ summary: result.text });
  });

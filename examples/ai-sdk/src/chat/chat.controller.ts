import { RhythmRouter } from "@rhythmjs/router";
import type { RhythmHttpContext } from "@rhythmjs/router/context";
import { convertToModelMessages, generateText, streamText, type UIMessage } from "ai";
import type { ChatModel } from "../ai/model.module";
import { error, json } from "@rhythmjs/router/response";

export type ChatContext = RhythmHttpContext & ChatModel;

export const chatController = new RhythmRouter<ChatContext>()
  .get("/api/model", (ctx) => {
    json(ctx, ctx.modelInfo);
  })
  .post("/api/chat", async (ctx) => {
    const { messages } = (await ctx.request.json()) as { messages?: UIMessage[] };
    if (!Array.isArray(messages) || messages.length === 0) {
      error(ctx, 400, "messages are required");
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
  .post("/api/summarize", async (ctx) => {
    const { text } = (await ctx.request.json()) as { text?: string };
    if (!text) {
      error(ctx, 400, "text is required");
      return;
    }

    const result = await generateText({
      model: ctx.model,
      prompt: `Summarize in one sentence: ${text}`,
      abortSignal: ctx.request.signal,
    });

    json(ctx, { summary: result.text });
  });

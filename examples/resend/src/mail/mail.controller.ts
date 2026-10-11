import { RhythmRouter } from "@rhythmjs/router";
import type { RhythmHttpContext } from "@rhythmjs/router/context";
import { escapeHtml, type mailService } from "./mail.service";
import { error, json } from "@rhythmjs/router/response";

export type MailContext = RhythmHttpContext & {
  mailService: typeof mailService;
};

export const mailController = new RhythmRouter<MailContext>().post("/contact", async (ctx) => {
  const { email, message } = (await ctx.request.json()) as { email?: string; message?: string };
  if (!email?.includes("@") || !message) {
    error(ctx, 400, "a valid email and a message are required");
    return;
  }

  const { data, error: sendError } = await ctx.mailService.send(
    email,
    "We got your message",
    `<p>${escapeHtml(message)}</p>`,
  );
  if (sendError) {
    error(ctx, 502, "Could not send the email");
    return;
  }

  json(ctx, { id: data.id }, 202);
});

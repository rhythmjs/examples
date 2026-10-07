import { RhythmRouter } from "@rhythmjs/router";
import type { RhythmHttpContext } from "@rhythmjs/router/context";
import { escapeHtml, type mailService } from "./mail.service";

export type MailContext = RhythmHttpContext & {
  mailService: typeof mailService;
};

export const mailController = new RhythmRouter<MailContext>().post("/contact", async (ctx) => {
  const { email, message } = (await ctx.request.json()) as { email?: string; message?: string };
  if (!email?.includes("@") || !message) {
    ctx.error(400, "a valid email and a message are required");
    return;
  }

  const { data, error } = await ctx.mailService.send(email, "We got your message", `<p>${escapeHtml(message)}</p>`);
  if (error) {
    ctx.error(502, "Could not send the email");
    return;
  }

  ctx.json({ id: data.id }, 202);
});

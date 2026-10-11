import { RhythmRouter } from "@rhythmjs/router";
import type { RhythmHttpContext } from "@rhythmjs/router/context";
import type { MailService } from "./mail.service";
import { error, json } from "@rhythmjs/router/response";

export type MailContext = RhythmHttpContext & {
  mailService: MailService;
};

export const mailController = new RhythmRouter<MailContext>().post("/signup", async (ctx) => {
  const { name, email } = (await ctx.request.json()) as { name?: string; email?: string };
  if (!name || !email?.includes("@")) {
    error(ctx, 400, "name and a valid email are required");
    return;
  }

  const info = await ctx.mailService.sendWelcome(email, name);
  json(ctx, { messageId: info.messageId }, 201);
});

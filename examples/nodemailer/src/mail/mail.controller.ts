import { RhythmRouter } from "@rhythmjs/router";
import type { RhythmHttpContext } from "@rhythmjs/router/context";
import type { MailService } from "./mail.service";

export type MailContext = RhythmHttpContext & {
  mailService: MailService;
};

export const mailController = new RhythmRouter<MailContext>().post("/signup", async (ctx) => {
  const { name, email } = (await ctx.request.json()) as { name?: string; email?: string };
  if (!name || !email?.includes("@")) {
    ctx.error(400, "name and a valid email are required");
    return;
  }

  const info = await ctx.mailService.sendWelcome(email, name);
  ctx.json({ messageId: info.messageId }, 201);
});

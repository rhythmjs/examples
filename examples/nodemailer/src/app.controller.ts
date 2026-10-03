import { RhythmRouter } from "@rhythmjs/router";
import type { RhythmHttpContext } from "@rhythmjs/router/adapters/context";
import type { appService } from "./app.service";
import type { Mailer } from "./mail/mail";

export type AppContext = RhythmHttpContext & {
  appService: typeof appService;
  mailer: Mailer;
};

export const appController = new RhythmRouter<AppContext>()
  .get("/", (ctx) => {
    ctx.text(ctx.appService.getHello());
  })
  .post("/signup", async (ctx) => {
    const { name, email } = (await ctx.request.json()) as { name?: string; email?: string };
    if (!name || !email?.includes("@")) {
      ctx.error(400, "name and a valid email are required");
      return;
    }

    const info = await ctx.mailer.sendWelcome(email, name);
    ctx.json({ messageId: info.messageId }, 201);
  });

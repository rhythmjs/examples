import { RhythmRouter } from "@rhythmjs/router";
import type { RhythmHttpContext } from "@rhythmjs/router/adapters/context";
import type { appService } from "./app.service";
import { escapeHtml, type mailService } from "./mail/mail.service";

export type AppContext = RhythmHttpContext & {
  appService: typeof appService;
  mailService: typeof mailService;
};

export const appController = new RhythmRouter<AppContext>()
  .get("/", (ctx) => {
    ctx.response.headers.set("content-type", "text/plain");
    ctx.response.body = ctx.appService.getHello();
  })
  .post("/contact", async (ctx) => {
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

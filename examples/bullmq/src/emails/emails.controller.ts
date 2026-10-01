import type { QueueService } from "@rhythmjs/bullmq";
import { RhythmRouter } from "@rhythmjs/router";
import type { RhythmHttpContext } from "@rhythmjs/router/adapters/context";
import type { mailService } from "./mail.service";
import type { AppJobs } from "./queue";

export type EmailsContext = RhythmHttpContext & {
  queueService: QueueService<AppJobs>;
  mailService: typeof mailService;
};

export const emailsController = new RhythmRouter<EmailsContext>({ prefix: "/emails" })
  .post("/", async (ctx) => {
    const { to, subject } = (await ctx.request.json()) as { to?: string; subject?: string };
    if (!to?.includes("@") || !subject) {
      ctx.error(400, "a valid to address and a subject are required");
      return;
    }

    const id = await ctx.queueService.add("email.send", { to, subject });
    ctx.json({ id }, 202);
  })
  .get("/", (ctx) => {
    ctx.json({ sent: ctx.mailService.sent() });
  })
  .get("/counts", async (ctx) => {
    ctx.json(await ctx.queueService.counts());
  });

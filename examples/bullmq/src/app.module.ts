import type { QueueService } from "@rhythmjs/bullmq";
import { Rhythm } from "@rhythmjs/rhythm";
import type { RhythmHttpContext } from "@rhythmjs/router/adapters/context";
import { appController } from "./app.controller";
import { appService } from "./app.service";
import { emailsModule } from "./emails/emails.module";
import type { AppJobs } from "./emails/queue";

export const appModule = new Rhythm<
  RhythmHttpContext,
  { appService: typeof appService; queueService: QueueService<AppJobs> }
>({
  name: "app",
  type: "module",
})
  .register(emailsModule)
  .use(appController.middleware())
  .use((ctx) => {
    ctx.response.status = 404;
    ctx.response.headers.set("content-type", "application/json");
    ctx.response.body = JSON.stringify({ success: false, status: 404, message: "Not Found" });
  });

appModule.context.appService = appService;

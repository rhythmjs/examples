import type { QueueService } from "@rhythmjs/bullmq";
import { Rhythm } from "@rhythmjs/rhythm";
import type { RhythmHttpContext } from "@rhythmjs/router/adapters/context";
import { emailsController } from "./emails.controller";
import { mailService } from "./mail.service";
import type { AppJobs } from "./queue";

export const emailsModule = new Rhythm<
  RhythmHttpContext & { queueService: QueueService<AppJobs> },
  { mailService: typeof mailService }
>({ name: "emails", type: "module" }).use(emailsController.middleware());

emailsModule.context.mailService = mailService;

import { Rhythm } from "@rhythmjs/rhythm";
import type { RhythmHttpContext } from "@rhythmjs/router/adapters/context";
import { emailsController } from "./emails.controller";
import { mailService } from "./mail.service";
import { closeQueue, createQueue } from "./queue";

export const emailsModule = new Rhythm<RhythmHttpContext>({ name: "emails", type: "module" })
  .provide(() => ({ mailService }))
  .provide(createQueue, closeQueue)
  .use(emailsController.middleware());

import type { S3Client } from "bun";
import { Rhythm } from "@rhythmjs/rhythm";
import type { RhythmHttpContext } from "@rhythmjs/router/adapters/context";
import { appController } from "./app.controller";
import { appService } from "./app.service";

export const appModule = new Rhythm<RhythmHttpContext, { appService: typeof appService; s3: S3Client }>({
  name: "app",
  type: "module",
})
  .use(appController.middleware())
  .use((ctx) => {
    ctx.json({ success: false, status: 404, message: "Not Found" }, 404);
  });

appModule.context.appService = appService;

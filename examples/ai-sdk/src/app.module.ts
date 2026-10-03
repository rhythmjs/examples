import { Rhythm } from "@rhythmjs/rhythm";
import type { RhythmHttpContext } from "@rhythmjs/router/adapters/context";
import { appController } from "./app.controller";
import { appService } from "./app.service";
import { chatModule } from "./chat/chat.module";

export const appModule = new Rhythm<RhythmHttpContext, { appService: typeof appService }>({
  name: "app",
  type: "module",
})
  .register(chatModule)
  .use(appController.middleware())
  .use((ctx) => {
    ctx.json({ success: false, status: 404, message: "Not Found" }, 404);
  });

appModule.context.appService = appService;

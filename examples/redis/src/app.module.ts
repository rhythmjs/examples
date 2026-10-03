import type { RedisClient } from "bun";
import { Rhythm } from "@rhythmjs/rhythm";
import type { RhythmHttpContext } from "@rhythmjs/router/adapters/context";
import { appController } from "./app.controller";
import { appService } from "./app.service";
import { productsModule } from "./products/products.module";

export const appModule = new Rhythm<RhythmHttpContext, { appService: typeof appService; redis: RedisClient }>({
  name: "app",
  type: "module",
})
  .register(productsModule)
  .use(appController.middleware())
  .use((ctx) => {
    ctx.json({ success: false, status: 404, message: "Not Found" }, 404);
  });

appModule.context.appService = appService;

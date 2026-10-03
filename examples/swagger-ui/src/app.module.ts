import { defineDocument } from "@rhythmjs/openapi/document";
import { openapiModule } from "@rhythmjs/openapi/module";
import { Rhythm } from "@rhythmjs/rhythm";
import { swaggerModule } from "@rhythmjs/swagger";
import type { RhythmHttpContext } from "@rhythmjs/router/adapters/context";
import { appController } from "./app.controller";
import { appService } from "./app.service";

const openapiConfig = defineDocument({ info: { title: "Hello API", version: "1.0.0" } });

export const appModule = new Rhythm<RhythmHttpContext, { appService: typeof appService }>({
  name: "app",
  type: "module",
})
  .register(openapiModule.forRoot({ document: openapiConfig }))
  .register(swaggerModule.forRoot())
  .use(appController.middleware())
  .use((ctx) => {
    ctx.response.status = 404;
    ctx.response.headers.set("content-type", "application/json");
    ctx.response.body = JSON.stringify({ success: false, status: 404, message: "Not Found" });
  });

appModule.context.appService = appService;

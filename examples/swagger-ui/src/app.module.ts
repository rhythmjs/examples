import { defineDocument } from "@rhythmjs/openapi/document";
import { openapiModule } from "@rhythmjs/openapi/module";
import { Rhythm, decorate, mount } from "@rhythmjs/rhythm";
import { swaggerModule } from "@rhythmjs/swagger";
import { appController } from "./app.controller";
import { appService } from "./app.service";

const document = defineDocument({ info: { title: "Hello API", version: "1.0.0" } });

export const appModule = new Rhythm({ name: "app" })
  .register(decorate(() => ({ appService })))
  .use(mount(openapiModule.forRoot({ document })))
  .use(mount(swaggerModule.forRoot()))
  .use(mount(appController));

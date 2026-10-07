import { Rhythm, decorate, mount } from "@rhythmjs/rhythm";
import { appController } from "./app.controller";
import { appService } from "./app.service";
import { createStorage } from "./storage";

export const appModule = new Rhythm({ name: "app" })
  .register(decorate(() => ({ appService, s3: createStorage() })))
  .use(mount(appController));

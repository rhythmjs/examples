import { Rhythm, decorate, mount } from "@rhythmjs/rhythm";
import { appController } from "./app.controller";
import { appService } from "./app.service";
import { chatModule } from "./chat/chat.module";

export const appModule = new Rhythm({ name: "app" })
  .register(decorate(() => ({ appService })))
  .use(mount(appController))
  .use(mount(chatModule));

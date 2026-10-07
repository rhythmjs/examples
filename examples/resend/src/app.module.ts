import { Rhythm, decorate, mount } from "@rhythmjs/rhythm";
import { appController } from "./app.controller";
import { appService } from "./app.service";
import { mailModule } from "./mail/mail.module";

export const appModule = new Rhythm({ name: "app" })
  .register(decorate(() => ({ appService })))
  .use(mount(appController))
  .use(mount(mailModule));

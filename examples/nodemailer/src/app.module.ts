import { Rhythm, decorate, include, mount } from "@rhythmjs/rhythm";
import { appController } from "./app.controller";
import { appService } from "./app.service";
import { mailModule } from "./mail/mail.module";
import { transportModule } from "./mail/transport.module";

export const appModule = new Rhythm({ name: "app" })
  .register(include(transportModule, ({ transport }) => ({ transport })))
  .register(decorate(() => ({ appService })))
  .use(mount(appController))
  .use(mount(mailModule));

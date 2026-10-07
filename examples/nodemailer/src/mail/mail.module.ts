import { Rhythm, decorate, include, mount } from "@rhythmjs/rhythm";
import { mailController } from "./mail.controller";
import { createMailService } from "./mail.service";
import { transportModule } from "./transport.module";

export const mailModule = new Rhythm({ name: "mail" })
  .register(include(transportModule, ({ transport }) => ({ transport })))
  .register(decorate(({ transport }) => ({ mailService: createMailService(transport) })))
  .use(mount(mailController));

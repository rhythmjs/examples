import { Rhythm, decorate, mount } from "@rhythmjs/rhythm";
import { mailController } from "./mail.controller";
import { mailService } from "./mail.service";

export const mailModule = new Rhythm({ name: "mail" })
  .register(decorate(() => ({ mailService })))
  .use(mount(mailController));

import { Rhythm, include, mount } from "@rhythmjs/rhythm";
import { modelModule } from "../ai/model.module";
import { chatController } from "./chat.controller";

export const chatModule = new Rhythm({ name: "chat" })
  .register(include(modelModule, ({ model, modelInfo }) => ({ model, modelInfo })))
  .use(mount(chatController));

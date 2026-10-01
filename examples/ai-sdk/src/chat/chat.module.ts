import { configModule, type ConfigContext } from "@rhythmjs/config";
import { derive, Rhythm } from "@rhythmjs/rhythm";
import type { RhythmHttpContext } from "@rhythmjs/router/adapters/context";
import { load } from "../config/ai.config";
import { chatController } from "./chat.controller";
import { modelService } from "./models";

type ConfiguredContext = RhythmHttpContext & ConfigContext<typeof load> & { modelService: typeof modelService };

export const chatModule = new Rhythm<RhythmHttpContext>({ name: "chat", type: "module" })
  .provide(() => ({ modelService }))
  .register(configModule.forRoot(...load), ({ configService }) => ({ configService }))
  .use(derive((ctx: ConfiguredContext) => ctx.modelService.create(ctx.configService.get("ai.model"))))
  .use(chatController.middleware());

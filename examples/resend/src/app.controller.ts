import { RhythmRouter } from "@rhythmjs/router";
import type { RhythmHttpContext } from "@rhythmjs/router/context";
import type { appService } from "./app.service";
import { text } from "@rhythmjs/router/response";

export type AppContext = RhythmHttpContext & {
  appService: typeof appService;
};

export const appController = new RhythmRouter<AppContext>().get("/", (ctx) => {
  text(ctx, ctx.appService.getHello());
});

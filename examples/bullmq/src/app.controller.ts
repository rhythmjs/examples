import { RhythmRouter } from "@rhythmjs/router";
import type { RhythmHttpContext } from "@rhythmjs/router/adapters/context";
import type { appService } from "./app.service";

export type AppContext = RhythmHttpContext & {
  appService: typeof appService;
};

export const appController = new RhythmRouter<AppContext>().get("/", (ctx) => {
  ctx.response.headers.set("content-type", "text/plain");
  ctx.response.body = ctx.appService.getHello();
});

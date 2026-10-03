import { betterAuthModule, cors, withSession } from "@rhythmjs/better-auth";
import { Rhythm } from "@rhythmjs/rhythm";
import type { RhythmHttpContext } from "@rhythmjs/router/adapters/context";
import { appController } from "./app.controller";
import { appService } from "./app.service";
import { auth, frontendOrigin } from "./lib/auth";

export const appModule = new Rhythm<RhythmHttpContext, { appService: typeof appService }>({
  name: "app",
  type: "module",
})
  .use(cors({ origin: frontendOrigin, credentials: true, allowHeaders: ["Content-Type", "Authorization"] }))
  .register(betterAuthModule.forRoot({ auth, path: "/api/auth" }), (m) => ({ auth: m.auth }))
  .use(withSession())
  .use(appController.middleware())
  .use((ctx) => {
    ctx.response.status = 404;
    ctx.response.headers.set("content-type", "application/json");
    ctx.response.body = JSON.stringify({ success: false, status: 404, message: "Not Found" });
  });

appModule.context.appService = appService;

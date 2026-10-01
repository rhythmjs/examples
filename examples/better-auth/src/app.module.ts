import { betterAuthModule, withSession } from "@rhythmjs/better-auth";
import { Rhythm } from "@rhythmjs/rhythm";
import type { RhythmHttpContext } from "@rhythmjs/router/adapters/context";
import { cors } from "@rhythmjs/security/cors";
import { appController } from "./app.controller";
import { appService } from "./app.service";
import { auth, closeAuthDatabase, frontendOrigin } from "./lib/auth";

export const appModule = new Rhythm<RhythmHttpContext>({ name: "app", type: "module" })
  .provide(
    () => ({ appService }),
    () => closeAuthDatabase(),
  )
  .use(cors({ origin: frontendOrigin, credentials: true, allowHeaders: ["Content-Type", "Authorization"] }))
  .register(betterAuthModule.forRoot({ auth, path: "/api/auth" }), (m) => ({ auth: m.auth }))
  .use(withSession())
  .use(appController.middleware())
  .use((ctx) => {
    ctx.response.status = 404;
    ctx.response.headers.set("content-type", "application/json");
    ctx.response.body = JSON.stringify({ success: false, status: 404, message: "Not Found" });
  });

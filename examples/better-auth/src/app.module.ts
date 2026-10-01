import { mount } from "@rhythmjs/http/mount";
import { Rhythm } from "@rhythmjs/rhythm";
import type { RhythmHttpContext } from "@rhythmjs/router/adapters/context";
import { cors } from "@rhythmjs/security/cors";
import { appController } from "./app.controller";
import { appService } from "./app.service";
import { auth, closeAuthDatabase, frontendOrigin } from "./lib/auth";
import { withSession } from "./lib/session";

export const appModule = new Rhythm<RhythmHttpContext>({ name: "app", type: "module" })
  .provide(() => ({ appService }))
  .provide(
    () => ({}),
    () => closeAuthDatabase(),
  )
  .use(cors({ origin: frontendOrigin, credentials: true, allowHeaders: ["Content-Type", "Authorization"] }))
  .use(mount("/api/auth/**", (ctx) => auth.handler(ctx.request)))
  .use(withSession)
  .use(appController.middleware())
  .use((ctx) => {
    ctx.response.status = 404;
    ctx.response.headers.set("content-type", "application/json");
    ctx.response.body = JSON.stringify({ success: false, status: 404, message: "Not Found" });
  });

import { authHandler, betterAuthModule, cors, withSession } from "@rhythmjs/better-auth";
import { Rhythm, decorate, include, mount } from "@rhythmjs/rhythm";
import type { RhythmHttpContext } from "@rhythmjs/router/context";
import { appController } from "./app.controller";
import { appService } from "./app.service";
import { auth, closeAuthDatabase, frontendOrigin } from "./lib/auth";
import { json } from "@rhythmjs/router/response";

export const appModule = new Rhythm<{}, RhythmHttpContext>({ name: "app" })
  .register(decorate(() => ({ appService })))
  .register(
    include(betterAuthModule.forRoot({ auth }), (child) => ({ auth: child.auth })),
    closeAuthDatabase,
  )
  .use(cors({ origin: frontendOrigin, credentials: true, allowHeaders: ["Content-Type", "Authorization"] }))
  .use(authHandler({ auth, path: "/api/auth" }))
  .use(withSession())
  .use(mount(appController))
  .use((ctx) => {
    // mount() always continues, so only answer when nothing has written a body yet
    if (ctx.response.body === null) json(ctx, { success: false, status: 404, message: "Not Found" }, 404);
  });

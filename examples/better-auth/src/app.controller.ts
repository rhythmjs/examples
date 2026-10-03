import { requireSession, type AuthContext, type SessionContext } from "@rhythmjs/better-auth";
import { RhythmRouter } from "@rhythmjs/router";
import type { RhythmHttpContext } from "@rhythmjs/router/adapters/context";
import type { appService } from "./app.service";

export type AppContext = RhythmHttpContext &
  AuthContext &
  SessionContext & {
    appService: typeof appService;
  };

export const appController = new RhythmRouter<AppContext>()
  .get("/", (ctx) => {
    ctx.text(ctx.appService.getHello());
  })
  .get("/me", requireSession(), (ctx) => {
    ctx.json({
      id: ctx.user.id,
      name: ctx.user.name,
      email: ctx.user.email,
      sessionExpiresAt: ctx.session.expiresAt,
    });
  });

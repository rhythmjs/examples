import { requireSession, type AuthContext, type SessionContext } from "@rhythmjs/better-auth";
import { RhythmRouter } from "@rhythmjs/router";
import type { RhythmHttpContext } from "@rhythmjs/router/context";
import type { appService } from "./app.service";
import { json, text } from "@rhythmjs/router/response";

export type AppContext = RhythmHttpContext &
  AuthContext &
  SessionContext & {
    appService: typeof appService;
  };

export const appController = new RhythmRouter<AppContext>()
  .get("/", (ctx) => {
    text(ctx, ctx.appService.getHello());
  })
  .get("/me", requireSession(), (ctx) => {
    json(ctx, {
      id: ctx.user.id,
      name: ctx.user.name,
      email: ctx.user.email,
      sessionExpiresAt: ctx.session.expiresAt,
    });
  });

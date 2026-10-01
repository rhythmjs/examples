import { derive } from "@rhythmjs/rhythm";
import type { DeriveMiddleware, Middleware } from "@rhythmjs/rhythm/types";
import type { RhythmHttpContext } from "@rhythmjs/router/adapters/context";
import { auth, type Session, type User } from "./auth";

export interface SessionContext {
  session: Session | null;
  user: User | null;
}

export const withSession = derive(async (ctx: RhythmHttpContext): Promise<SessionContext> => {
  const result = await auth.api.getSession({ headers: ctx.request.headers });
  return { session: result?.session ?? null, user: result?.user ?? null };
});

type SessionGuard = DeriveMiddleware<RhythmHttpContext & SessionContext, { session: Session; user: User }>;

const guard: Middleware<RhythmHttpContext & SessionContext> = async (ctx, next) => {
  if (!ctx.session || !ctx.user) {
    ctx.error(401, "Unauthorized");
    return;
  }
  await next();
};

export const requireSession = guard as SessionGuard;

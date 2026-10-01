import { Database } from "bun:sqlite";
import { betterAuth } from "better-auth";

const database = new Database(process.env.AUTH_DB ?? "auth.db");

export const frontendOrigin = process.env.FRONTEND_URL ?? "http://localhost:3001";

export const auth = betterAuth({
  database,
  baseURL: process.env.BETTER_AUTH_URL ?? "http://localhost:3007",
  secret: process.env.BETTER_AUTH_SECRET ?? "rhythmjs-better-auth-example-secret-change-me",
  trustedOrigins: [frontendOrigin],
  emailAndPassword: { enabled: true },
});

type AuthSession = typeof auth.$Infer.Session;

export type User = AuthSession["user"];
export type Session = AuthSession["session"];

export function closeAuthDatabase(): void {
  database.close();
}

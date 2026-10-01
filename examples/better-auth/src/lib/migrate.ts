import { getMigrations } from "better-auth/db/migration";
import { auth } from "./auth";

export async function migrate(): Promise<void> {
  const { runMigrations } = await getMigrations(auth.options);
  await runMigrations();
}

if (import.meta.main) {
  await migrate();
  console.log("better-auth tables are up to date");
}

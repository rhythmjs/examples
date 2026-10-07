import { decorate, Rhythm } from "@rhythmjs/rhythm";
import { createDatabase } from "./database";

// one shared connection, created on first use (the app and the notes module both include this module)
let database: ReturnType<typeof createDatabase> | undefined;
const getDatabase = () => (database ??= createDatabase());

export const databaseModule = new Rhythm({ name: "database" }).register(
  decorate(async () => ({ db: (await getDatabase()).db })),
  async () => (await getDatabase()).client.close(),
);

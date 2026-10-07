import { decorate, Rhythm } from "@rhythmjs/rhythm";
import { createDatabase } from "./database";

const database = createDatabase();

export const databaseModule = new Rhythm({ name: "database" }).register(
  decorate(() => ({ db: database })),
  () => database.$client.close(),
);

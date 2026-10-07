import { decorate, Rhythm } from "@rhythmjs/rhythm";
import { createOrm } from "./database";

// one shared ORM, created on first use (the app and the notes module both include this module)
let orm: ReturnType<typeof createOrm> | undefined;
const getOrm = () => (orm ??= createOrm());

export const databaseModule = new Rhythm({ name: "database" }).register(
  decorate(async () => ({ orm: await getOrm() })),
  async () => (await getOrm()).close(),
);

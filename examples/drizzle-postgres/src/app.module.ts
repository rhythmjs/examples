import { include, mount, Rhythm } from "@rhythmjs/rhythm";
import { databaseModule } from "./database.module";
import { notesModule } from "./notes/notes.module";

export const appModule = new Rhythm({ name: "app" })
  .register(include(databaseModule, ({ db }) => ({ db })))
  .use(mount(notesModule));

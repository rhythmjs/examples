import { HttpError, filter } from "@rhythmjs/middleware/filter";
import { Rhythm } from "@rhythmjs/rhythm";
import type { RhythmHttpContext } from "@rhythmjs/router/context";
import { closeDatabase, createDatabase } from "./database";
import { notesModule } from "./notes/notes.module";

export const appModule = new Rhythm<RhythmHttpContext>({ name: "app", type: "module" })
  .use(filter())
  .provide(createDatabase, closeDatabase)
  .register(notesModule)
  .use(() => {
    throw new HttpError(404, "Route not found");
  });

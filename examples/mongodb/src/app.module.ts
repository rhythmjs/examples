import type { Db } from "mongodb";
import { HttpError, filter } from "@rhythmjs/middleware/filter";
import { Rhythm } from "@rhythmjs/rhythm";
import type { RhythmHttpContext } from "@rhythmjs/router/context";
import { notesModule } from "./notes/notes.module";

export const appModule = new Rhythm<RhythmHttpContext, { db: Db }>({ name: "app", type: "module" })
  .use(filter())
  .register(notesModule)
  .use(() => {
    throw new HttpError(404, "Route not found");
  });

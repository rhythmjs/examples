import { HttpError, filter } from "@rhythmjs/middleware/filter";
import { Rhythm } from "@rhythmjs/rhythm";
import type { RhythmHttpContext } from "@rhythmjs/router/context";
import { closeDatabase, createDatabase } from "./database";
import { notesController } from "./notes/notes.controller";
import { createNotesService } from "./notes/notes.service";

export const appModule = new Rhythm<RhythmHttpContext>({ name: "app", type: "module" })
  .use(filter())
  .provide(createDatabase, closeDatabase)
  .provide(({ db }) => ({ notesService: createNotesService(db) }))
  .use(notesController.middleware())
  .use(() => {
    throw new HttpError(404, "Route not found");
  });

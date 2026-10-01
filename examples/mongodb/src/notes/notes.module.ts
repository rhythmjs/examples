import type { Db } from "mongodb";
import { derive, Rhythm } from "@rhythmjs/rhythm";
import type { RhythmHttpContext } from "@rhythmjs/router/context";
import { notesController } from "./notes.controller";
import { createNotesService } from "./notes.service";

export type NotesModuleInput = RhythmHttpContext & { db: Db };

export const notesModule = new Rhythm<NotesModuleInput>({ name: "notes", type: "module" })
  .use(derive(({ db }: NotesModuleInput) => ({ notesService: createNotesService(db) })))
  .use(notesController.middleware());

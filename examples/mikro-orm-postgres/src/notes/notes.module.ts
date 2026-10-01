import type { MikroORM } from "@mikro-orm/postgresql";
import { derive, Rhythm } from "@rhythmjs/rhythm";
import type { RhythmHttpContext } from "@rhythmjs/router/context";
import { notesController } from "./notes.controller";
import { createNotesService } from "./notes.service";

export type NotesModuleInput = RhythmHttpContext & { orm: MikroORM };

export const notesModule = new Rhythm<NotesModuleInput>({ name: "notes", type: "module" })
  .use(derive(({ orm }: NotesModuleInput) => ({ notesService: createNotesService(orm) })))
  .use(notesController.middleware());

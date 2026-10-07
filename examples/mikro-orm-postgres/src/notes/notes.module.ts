import { decorate, include, mount, Rhythm } from "@rhythmjs/rhythm";
import { databaseModule } from "../database.module";
import { notesController } from "./notes.controller";
import { createNotesService } from "./notes.service";

export const notesModule = new Rhythm({ name: "notes" })
  .register(include(databaseModule, ({ orm }) => ({ orm })))
  .register(decorate(({ orm }) => ({ notesService: createNotesService(orm) })))
  .use(mount(notesController));

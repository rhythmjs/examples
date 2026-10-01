import type { PrismaClient } from "@prisma/client";
import { derive, Rhythm } from "@rhythmjs/rhythm";
import type { RhythmHttpContext } from "@rhythmjs/router/context";
import { notesController } from "./notes.controller";
import { createNotesService } from "./notes.service";

export type NotesModuleInput = RhythmHttpContext & { prisma: PrismaClient };

export const notesModule = new Rhythm<NotesModuleInput>({ name: "notes", type: "module" })
  .use(derive(({ prisma }: NotesModuleInput) => ({ notesService: createNotesService(prisma) })))
  .use(notesController.middleware());

import type { MikroORM } from "@mikro-orm/postgresql";
import { Note } from "./note.entity";
import type { CreateNoteInput, UpdateNoteInput } from "./notes.schema";

export function createNotesService(orm: MikroORM) {
  return {
    list(): Promise<Note[]> {
      return orm.em.fork().find(Note, {}, { orderBy: { createdAt: "desc" } });
    },
    get(id: string): Promise<Note | null> {
      return orm.em.fork().findOne(Note, { id });
    },
    async create(input: CreateNoteInput): Promise<Note> {
      const em = orm.em.fork();
      const note = em.create(Note, { title: input.title, content: input.content });
      await em.flush();
      return note;
    },
    async update(id: string, patch: UpdateNoteInput): Promise<Note | null> {
      const em = orm.em.fork();
      const note = await em.findOne(Note, { id });
      if (!note) return null;
      em.assign(note, patch);
      await em.flush();
      return note;
    },
    async remove(id: string): Promise<boolean> {
      const em = orm.em.fork();
      const note = await em.findOne(Note, { id });
      if (!note) return false;
      await em.remove(note).flush();
      return true;
    },
  };
}

export type NotesService = ReturnType<typeof createNotesService>;

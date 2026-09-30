import { desc, eq } from "drizzle-orm";
import type { Database } from "../database";
import type { CreateNoteInput, UpdateNoteInput } from "./notes.schema";
import { notes, type Note } from "./notes.table";

export function createNotesService(db: Database) {
  return {
    list(): Promise<Note[]> {
      return db.select().from(notes).orderBy(desc(notes.createdAt));
    },
    async get(id: string): Promise<Note | undefined> {
      const [note] = await db.select().from(notes).where(eq(notes.id, id));
      return note;
    },
    async create(input: CreateNoteInput): Promise<Note> {
      const [note] = await db.insert(notes).values(input).returning();
      return note;
    },
    async update(id: string, patch: UpdateNoteInput): Promise<Note | undefined> {
      const [note] = await db
        .update(notes)
        .set({ ...patch, updatedAt: new Date() })
        .where(eq(notes.id, id))
        .returning();
      return note;
    },
    async remove(id: string): Promise<boolean> {
      const deleted = await db.delete(notes).where(eq(notes.id, id)).returning({ id: notes.id });
      return deleted.length > 0;
    },
  };
}

export type NotesService = ReturnType<typeof createNotesService>;

import { Prisma, type Note, type PrismaClient } from "@prisma/client";
import type { CreateNoteInput, UpdateNoteInput } from "./notes.schema";

function isRecordNotFound(error: unknown): boolean {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025";
}

export function createNotesService(prisma: PrismaClient) {
  return {
    list(): Promise<Note[]> {
      return prisma.note.findMany({ orderBy: { createdAt: "desc" } });
    },
    get(id: string): Promise<Note | null> {
      return prisma.note.findUnique({ where: { id } });
    },
    create(input: CreateNoteInput): Promise<Note> {
      return prisma.note.create({ data: input });
    },
    async update(id: string, patch: UpdateNoteInput): Promise<Note | null> {
      try {
        return await prisma.note.update({ where: { id }, data: patch });
      } catch (error) {
        if (isRecordNotFound(error)) return null;
        throw error;
      }
    },
    async remove(id: string): Promise<boolean> {
      try {
        await prisma.note.delete({ where: { id } });
        return true;
      } catch (error) {
        if (isRecordNotFound(error)) return false;
        throw error;
      }
    },
  };
}

export type NotesService = ReturnType<typeof createNotesService>;

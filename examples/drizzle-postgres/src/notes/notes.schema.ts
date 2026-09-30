import { z } from "zod";

export const createNoteSchema = z.object({
  title: z.string().trim().min(1, "title must be a non-empty string"),
  content: z.string().default(""),
});

export const updateNoteSchema = z
  .object({
    title: z.string().trim().min(1, "title must be a non-empty string").optional(),
    content: z.string().optional(),
  })
  .refine((patch) => patch.title !== undefined || patch.content !== undefined, {
    message: 'provide "title" and/or "content" to update',
  });

export const noteSchema = z.object({
  id: z.string(),
  title: z.string(),
  content: z.string(),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
});

export const notesResponseSchema = z.union([noteSchema, z.array(noteSchema)]);

export type CreateNoteInput = z.infer<typeof createNoteSchema>;
export type UpdateNoteInput = z.infer<typeof updateNoteSchema>;

import { defineEntity, p } from "@mikro-orm/core";

export const NoteSchema = defineEntity({
  name: "Note",
  tableName: "notes",
  properties: {
    id: p
      .string()
      .primary()
      .onCreate(() => crypto.randomUUID()),
    title: p.string(),
    content: p.text().default(""),
    createdAt: p
      .datetime()
      .fieldName("created_at")
      .onCreate(() => new Date()),
    updatedAt: p
      .datetime()
      .fieldName("updated_at")
      .onCreate(() => new Date())
      .onUpdate(() => new Date()),
  },
});

export class Note extends NoteSchema.class {}
NoteSchema.setClass(Note);

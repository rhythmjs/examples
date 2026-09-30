import { EntitySchema } from "@mikro-orm/core";

export class Note {
  id: string = crypto.randomUUID();
  title: string;
  content: string;
  createdAt: Date = new Date();
  updatedAt: Date = new Date();

  constructor(title: string, content: string = "") {
    this.title = title;
    this.content = content;
  }
}

export const noteEntitySchema = new EntitySchema<Note>({
  class: Note,
  tableName: "notes",
  properties: {
    id: { type: "string", primary: true },
    title: { type: "string" },
    content: { type: "text", default: "" },
    createdAt: { type: "datetime", fieldName: "created_at" },
    updatedAt: { type: "datetime", fieldName: "updated_at", onUpdate: () => new Date() },
  },
});

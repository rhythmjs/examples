import { ObjectId, type Collection, type Db } from "mongodb";
import type { CreateNoteInput, UpdateNoteInput } from "./notes.schema";

interface NoteDocument {
  _id: ObjectId;
  title: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

function toNote(doc: NoteDocument): Note {
  return {
    id: doc._id.toHexString(),
    title: doc.title,
    content: doc.content,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

function toObjectId(id: string): ObjectId | undefined {
  return ObjectId.isValid(id) ? new ObjectId(id) : undefined;
}

export function createNotesService(db: Db) {
  const collection: Collection<NoteDocument> = db.collection("notes");

  return {
    async list(): Promise<Note[]> {
      const docs = await collection.find().sort({ createdAt: -1 }).toArray();
      return docs.map(toNote);
    },
    async get(id: string): Promise<Note | null> {
      const _id = toObjectId(id);
      if (!_id) return null;
      const doc = await collection.findOne({ _id });
      return doc && toNote(doc);
    },
    async create(input: CreateNoteInput): Promise<Note> {
      const now = new Date();
      const doc: NoteDocument = { _id: new ObjectId(), ...input, createdAt: now, updatedAt: now };
      await collection.insertOne(doc);
      return toNote(doc);
    },
    async update(id: string, patch: UpdateNoteInput): Promise<Note | null> {
      const _id = toObjectId(id);
      if (!_id) return null;
      const doc = await collection.findOneAndUpdate(
        { _id },
        { $set: { ...patch, updatedAt: new Date() } },
        { returnDocument: "after" },
      );
      return doc && toNote(doc);
    },
    async remove(id: string): Promise<boolean> {
      const _id = toObjectId(id);
      if (!_id) return false;
      const result = await collection.deleteOne({ _id });
      return result.deletedCount > 0;
    },
  };
}

export type NotesService = ReturnType<typeof createNotesService>;

import { join } from "node:path";
import { Migrator } from "@mikro-orm/migrations";
import { MikroORM } from "@mikro-orm/postgresql";
import { NoteSchema } from "./notes/note.entity";

const clientUrl = process.env.DATABASE_URL ?? "postgres://postgres:postgres@localhost:5432/notes_mikro_orm";

export interface Database {
  orm: MikroORM;
  close(): Promise<void>;
}

export async function createDatabase(): Promise<Database> {
  const orm = await MikroORM.init({
    clientUrl,
    entities: [NoteSchema],
    extensions: [Migrator],
    migrations: {
      path: join(import.meta.dirname, "migrations"),
      snapshot: false,
    },
  });
  return { orm, close: () => orm.close() };
}

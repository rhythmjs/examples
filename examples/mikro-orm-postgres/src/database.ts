import { join } from "node:path";
import { Migrator } from "@mikro-orm/migrations";
import { MikroORM } from "@mikro-orm/postgresql";
import { NoteSchema } from "./notes/note.entity";

const clientUrl = process.env.DATABASE_URL ?? "postgres://postgres:postgres@localhost:5432/notes_mikro_orm";

export async function createDatabase(): Promise<{ orm: MikroORM }> {
  const orm = await MikroORM.init({
    clientUrl,
    entities: [NoteSchema],
    extensions: [Migrator],
    migrations: {
      path: join(import.meta.dirname, "migrations"),
      snapshot: false,
    },
  });
  return { orm };
}

export async function closeDatabase({ orm }: { orm: MikroORM }): Promise<void> {
  await orm.close();
}

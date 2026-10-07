import { SQL } from "bun";
import { drizzle } from "drizzle-orm/bun-sql";
import * as schema from "./notes/notes.table";

const databaseUrl = process.env.DATABASE_URL ?? "postgres://postgres:postgres@localhost:5432/notes_drizzle";

export type Database = ReturnType<typeof createDatabase>;

export function createDatabase() {
  return drizzle({ client: new SQL(databaseUrl), schema });
}

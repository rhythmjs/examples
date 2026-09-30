import { SQL } from "bun";
import { drizzle, type BunSQLDatabase } from "drizzle-orm/bun-sql";
import * as schema from "./notes/notes.table";

const databaseUrl = process.env.DATABASE_URL ?? "postgres://postgres:postgres@localhost:5432/notes_drizzle";

export type Database = BunSQLDatabase<typeof schema>;

export interface DatabaseValue {
  db: Database;
  "#client": SQL;
}

export function createDatabase(): DatabaseValue {
  const client = new SQL(databaseUrl);
  return { db: drizzle({ client, schema }), "#client": client };
}

export async function closeDatabase(value: DatabaseValue): Promise<void> {
  await value["#client"].close();
}

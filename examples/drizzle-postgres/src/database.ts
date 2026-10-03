import { SQL } from "bun";
import { drizzle, type BunSQLDatabase } from "drizzle-orm/bun-sql";
import * as schema from "./notes/notes.table";

const databaseUrl = process.env.DATABASE_URL ?? "postgres://postgres:postgres@localhost:5432/notes_drizzle";

export type Database = BunSQLDatabase<typeof schema>;

export interface DatabaseHandle {
  db: Database;
  close(): Promise<void>;
}

export function createDatabase(): DatabaseHandle {
  const client = new SQL(databaseUrl);
  return { db: drizzle({ client, schema }), close: () => client.close() };
}

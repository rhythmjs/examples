import { MongoClient, type Db } from "mongodb";

const mongoUrl = process.env.MONGODB_URL ?? "mongodb://localhost:27017";
const dbName = process.env.MONGODB_DB ?? "notes_mongodb";

export interface Database {
  db: Db;
  close(): Promise<void>;
}

export async function createDatabase(): Promise<Database> {
  const client = new MongoClient(mongoUrl);
  await client.connect();
  const db = client.db(dbName);
  await db.collection("notes").createIndex({ createdAt: -1 });
  return { db, close: () => client.close() };
}

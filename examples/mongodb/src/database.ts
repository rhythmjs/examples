import { MongoClient, type Db } from "mongodb";

const mongoUrl = process.env.MONGODB_URL ?? "mongodb://localhost:27017";
const dbName = process.env.MONGODB_DB ?? "notes_mongodb";

export interface DatabaseValue {
  db: Db;
  "#client": MongoClient;
}

export async function createDatabase(): Promise<DatabaseValue> {
  const client = new MongoClient(mongoUrl);
  await client.connect();
  const db = client.db(dbName);
  await db.collection("notes").createIndex({ createdAt: -1 });
  return { db, "#client": client };
}

export async function closeDatabase(value: DatabaseValue): Promise<void> {
  await value["#client"].close();
}

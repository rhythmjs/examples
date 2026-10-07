import { MongoClient } from "mongodb";

const mongoUrl = process.env.MONGODB_URL ?? "mongodb://localhost:27017";
const dbName = process.env.MONGODB_DB ?? "notes_mongodb";

export async function createDatabase() {
  const client = new MongoClient(mongoUrl);
  await client.connect();
  const db = client.db(dbName);
  await db.collection("notes").createIndex({ createdAt: -1 });
  return { client, db };
}

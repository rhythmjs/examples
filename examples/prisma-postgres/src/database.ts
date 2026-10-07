import { PrismaClient } from "@prisma/client";

const databaseUrl = process.env.DATABASE_URL ?? "postgres://postgres:postgres@localhost:5432/notes_prisma";

export function createPrisma() {
  return new PrismaClient({ datasourceUrl: databaseUrl });
}

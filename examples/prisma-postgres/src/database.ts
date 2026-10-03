import { PrismaClient } from "@prisma/client";

const databaseUrl = process.env.DATABASE_URL ?? "postgres://postgres:postgres@localhost:5432/notes_prisma";

export interface Database {
  prisma: PrismaClient;
  close(): Promise<void>;
}

export function createDatabase(): Database {
  const prisma = new PrismaClient({ datasourceUrl: databaseUrl });
  return { prisma, close: () => prisma.$disconnect() };
}

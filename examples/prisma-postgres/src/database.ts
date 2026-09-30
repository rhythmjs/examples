import { PrismaClient } from "@prisma/client";

const databaseUrl = process.env.DATABASE_URL ?? "postgres://postgres:postgres@localhost:5432/notes_prisma";

export function createDatabase(): { prisma: PrismaClient } {
  return { prisma: new PrismaClient({ datasourceUrl: databaseUrl }) };
}

export async function closeDatabase({ prisma }: { prisma: PrismaClient }): Promise<void> {
  await prisma.$disconnect();
}

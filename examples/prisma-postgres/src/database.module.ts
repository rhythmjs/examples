import { decorate, Rhythm } from "@rhythmjs/rhythm";
import { createPrisma } from "./database";

const prisma = createPrisma();

export const databaseModule = new Rhythm({ name: "database" }).register(
  decorate(() => ({ prisma })),
  () => prisma.$disconnect(),
);

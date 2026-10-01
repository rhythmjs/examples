import { registerAs } from "@rhythmjs/config";
import { z } from "zod";

export const aiConfig = registerAs("ai", z.object({ model: z.string().min(1).default("gpt-4o-mini") }), () => ({
  model: process.env.AI_MODEL,
}));

export const load = [aiConfig] as const;

import { Rhythm, decorate } from "@rhythmjs/rhythm";
import { RedisClient } from "bun";

const redis = new RedisClient(process.env.REDIS_URL ?? "redis://localhost:6379");

export const redisModule = new Rhythm({ name: "redis" }).register(
  decorate(() => ({ redis })),
  () => redis.close(),
);

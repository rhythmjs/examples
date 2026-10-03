import { RedisClient } from "bun";

export function createRedis(): RedisClient {
  return new RedisClient(process.env.REDIS_URL ?? "redis://localhost:6379");
}

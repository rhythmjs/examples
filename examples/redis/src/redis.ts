import { RedisClient } from "bun";

export function createRedis() {
  return { redis: new RedisClient(process.env.REDIS_URL ?? "redis://localhost:6379") };
}

export function closeRedis(value: ReturnType<typeof createRedis>) {
  value.redis.close();
}

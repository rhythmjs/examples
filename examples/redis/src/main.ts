import { toFetchHandler } from "@rhythmjs/router/fetch";
import { appModule } from "./app.module";
import { createRedis } from "./redis";

const port = Number(process.env.PORT ?? 3011);
const redis = createRedis();
appModule.context.redis = redis;

const server = Bun.serve({ port, fetch: toFetchHandler(appModule) });
console.log(`listening on ${server.url}`);

process.on("SIGINT", async () => {
  await server.stop();
  redis.close();
  process.exit(0);
});

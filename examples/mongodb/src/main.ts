import { toFetchHandler } from "@rhythmjs/router/fetch";
import { appModule } from "./app.module";

const port = Number(process.env.PORT ?? 3004);

const server = Bun.serve({ port, fetch: toFetchHandler(appModule) });
console.log(`listening on ${server.url}`);

async function shutdown(): Promise<void> {
  await server.stop();
  await appModule.stop();
  process.exit(0);
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

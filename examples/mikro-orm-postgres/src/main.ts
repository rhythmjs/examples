import { errorToResponse, toFetchHandler } from "@rhythmjs/router/fetch";
import { appModule } from "./app.module";
import { createDatabase } from "./database";

const port = Number(process.env.PORT ?? 3003);
const database = await createDatabase();
appModule.context.orm = database.orm;

const handler = toFetchHandler(appModule);

const server = Bun.serve({
  port,
  async fetch(request) {
    try {
      return await handler(request);
    } catch (error) {
      return errorToResponse(error);
    }
  },
});

console.log(`listening on ${server.url}`);

async function shutdown(): Promise<void> {
  await server.stop();
  await database.close();
  process.exit(0);
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

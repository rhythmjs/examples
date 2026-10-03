import { toFetchHandler } from "@rhythmjs/router/fetch";
import { appModule } from "./app.module";
import { closeAuthDatabase } from "./lib/auth";
import { migrate } from "./lib/migrate";

await migrate();

const port = Number(process.env.PORT ?? 3007);

const server = Bun.serve({ port, fetch: toFetchHandler(appModule) });
console.log(`listening on ${server.url}`);

process.on("SIGINT", async () => {
  await server.stop();
  closeAuthDatabase();
  process.exit(0);
});

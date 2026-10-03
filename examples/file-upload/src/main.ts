import { toFetchHandler } from "@rhythmjs/router/fetch";
import { appModule } from "./app.module";
import { createStorage } from "./storage";

const port = Number(process.env.PORT ?? 3012);
appModule.context.s3 = createStorage();

const server = Bun.serve({ port, fetch: toFetchHandler(appModule) });
console.log(`listening on ${server.url}`);

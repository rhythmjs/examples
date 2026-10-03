import { toFetchHandler } from "@rhythmjs/router/fetch";
import { appModule } from "./app.module";
import { mailService } from "./emails/mail.service";
import { createQueue } from "./emails/queue";

const port = Number(process.env.PORT ?? 3013);
const queueService = createQueue(mailService);
appModule.context.queueService = queueService;

const server = Bun.serve({ port, fetch: toFetchHandler(appModule) });
console.log(`listening on ${server.url}`);

process.on("SIGINT", async () => {
  await server.stop();
  await queueService.close();
  process.exit(0);
});

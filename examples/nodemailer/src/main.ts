import { toFetchHandler } from "@rhythmjs/router/fetch";
import { appModule } from "./app.module";
import { createMailer } from "./mail/mail";

const port = Number(process.env.PORT ?? 3009);
const { mailer, close } = createMailer();
appModule.context.mailer = mailer;

const server = Bun.serve({ port, fetch: toFetchHandler(appModule) });
console.log(`listening on ${server.url}`);

process.on("SIGINT", async () => {
  await server.stop();
  close();
  process.exit(0);
});

import { createQueueService } from "@rhythmjs/bullmq";
import type { mailService } from "./mail.service";

export type AppJobs = {
  "email.send": { to: string; subject: string };
};

const redisUrl = new URL(process.env.REDIS_URL ?? "redis://localhost:6379");

export function createQueue(mail: typeof mailService) {
  const queueService = createQueueService<AppJobs>({
    name: "emails",
    connection: { host: redisUrl.hostname, port: Number(redisUrl.port || 6379) },
    defaultJobOptions: {
      attempts: 3,
      backoff: { type: "exponential", delay: 500 },
      removeOnComplete: true,
      removeOnFail: 100,
    },
  });
  queueService.process({ "email.send": (payload) => mail.send(payload) }, { concurrency: 4 });
  return queueService;
}

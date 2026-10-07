import { Rhythm, decorate } from "@rhythmjs/rhythm";
import nodemailer from "nodemailer";

const transport = process.env.SMTP_HOST
  ? nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT ?? 1025),
      auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } : undefined,
    })
  : nodemailer.createTransport({ jsonTransport: true });

export const transportModule = new Rhythm({ name: "transport" }).register(
  decorate(() => ({ transport })),
  () => transport.close(),
);

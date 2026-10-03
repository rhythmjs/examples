import nodemailer from "nodemailer";

export function createMailer() {
  const transport = process.env.SMTP_HOST
    ? nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT ?? 1025),
        auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } : undefined,
      })
    : nodemailer.createTransport({ jsonTransport: true });

  return {
    mailer: {
      sendWelcome: (to: string, name: string) =>
        transport.sendMail({
          from: "RhythmJS <hello@example.com>",
          to,
          subject: `Welcome, ${name}`,
          text: `Hi ${name}, thanks for signing up.`,
        }),
    },
    close: () => transport.close(),
  };
}

export type Mailer = ReturnType<typeof createMailer>["mailer"];

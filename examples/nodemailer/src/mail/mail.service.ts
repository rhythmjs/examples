import type { Transporter } from "nodemailer";

export function createMailService(transport: Transporter) {
  return {
    sendWelcome: (to: string, name: string) =>
      transport.sendMail({
        from: "RhythmJS <hello@example.com>",
        to,
        subject: `Welcome, ${name}`,
        text: `Hi ${name}, thanks for signing up.`,
      }),
  };
}

export type MailService = ReturnType<typeof createMailService>;

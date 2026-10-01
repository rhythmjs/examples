import { Resend } from "resend";

const FROM = process.env.MAIL_FROM ?? "RhythmJS <onboarding@resend.dev>";

let client: Resend | undefined;

export const mailService = {
  send(to: string, subject: string, html: string) {
    client ??= new Resend(process.env.RESEND_API_KEY);
    return client.emails.send({ from: FROM, to, subject, html });
  },
};

export function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (char) => `&#${char.charCodeAt(0)};`);
}

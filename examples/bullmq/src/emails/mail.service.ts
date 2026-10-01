export type Mail = { to: string; subject: string };

const sent: Mail[] = [];

export const mailService = {
  send(mail: Mail) {
    sent.push(mail);
  },
  sent(): readonly Mail[] {
    return sent;
  },
};

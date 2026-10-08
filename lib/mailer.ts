import nodemailer from "nodemailer";

export type MailPayload = {
  to: string | string[];
  subject: string;
  text: string;
  html?: string;
  replyTo?: string;
};

function hasSmtpConfig() {
  return Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
}

export function getMailFrom() {
  return process.env.SMTP_FROM || process.env.CONTACT_NOTIFY_EMAIL || "contact@bestcrea.com";
}

export async function sendMail(payload: MailPayload): Promise<{
  ok: boolean;
  mode: "smtp" | "dev-log";
  messageId?: string;
}> {
  const from = getMailFrom();

  if (!hasSmtpConfig()) {
    console.info("[mailer:dev]", {
      from,
      to: payload.to,
      subject: payload.subject,
      text: payload.text,
      replyTo: payload.replyTo,
    });
    return { ok: true, mode: "dev-log" };
  }

  const port = Number(process.env.SMTP_PORT || 587);
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port,
    secure: port === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  const info = await transporter.sendMail({
    from,
    to: payload.to,
    subject: payload.subject,
    text: payload.text,
    html: payload.html,
    replyTo: payload.replyTo,
  });

  return { ok: true, mode: "smtp", messageId: info.messageId };
}

export async function notifyNewLead(input: {
  name: string;
  email: string;
  phone?: string | null;
  company?: string | null;
  message?: string | null;
  source?: string | null;
  locale?: string | null;
  metadata?: {
    city?: string;
    address?: string;
    isCompany?: boolean;
    ice?: string;
    rc?: string;
  };
}) {
  const to = process.env.CONTACT_NOTIFY_EMAIL || getMailFrom();
  const subject = `[Bestcrea] Nouveau lead — ${input.name}`;
  const meta = input.metadata;
  const text = [
    "Nouveau lead reçu via Bestcrea.",
    "",
    `Nom: ${input.name}`,
    `Email: ${input.email}`,
    `Téléphone: ${input.phone || "—"}`,
    `Ville: ${meta?.city || "—"}`,
    `Adresse: ${meta?.address || "—"}`,
    `Type de client: ${meta?.isCompany ? "Entreprise" : "Particulier"}`,
    `Société: ${input.company || "—"}`,
    ...(meta?.isCompany
      ? [`ICE: ${meta.ice || "—"}`, `RC: ${meta.rc || "—"}`]
      : []),
    `Source: ${input.source || "—"}`,
    `Locale: ${input.locale || "fr"}`,
    "",
    "Message:",
    input.message || "—",
  ].join("\n");

  return sendMail({
    to,
    subject,
    text,
    replyTo: input.email,
  });
}

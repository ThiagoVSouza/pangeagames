import client from "@sendgrid/client";
import mail from "@sendgrid/mail";
import { config, sendGridConfigured } from "../config.js";
import type { ContactInput, NewsletterInput, SupportInput } from "../validation/forms.js";

if (config.SENDGRID_API_KEY) {
  client.setApiKey(config.SENDGRID_API_KEY);
  mail.setApiKey(config.SENDGRID_API_KEY);
}

export type DeliveryResult = { mode: "sendgrid" | "mock" };

function assertProductionConfiguration() {
  if (config.NODE_ENV === "production" && !sendGridConfigured) {
    throw new Error("SendGrid is not configured");
  }
}

export async function subscribe(input: NewsletterInput): Promise<DeliveryResult> {
  assertProductionConfiguration();
  if (!sendGridConfigured || !config.SENDGRID_NEWSLETTER_LIST_ID) return { mode: "mock" };

  const customFields = config.SENDGRID_LANGUAGE_FIELD_ID
    ? { [config.SENDGRID_LANGUAGE_FIELD_ID]: input.locale }
    : {};

  await client.request({
    method: "PUT",
    url: "/v3/marketing/contacts",
    body: {
      list_ids: [config.SENDGRID_NEWSLETTER_LIST_ID],
      contacts: [{ email: input.email, custom_fields: customFields }],
    },
  });
  return { mode: "sendgrid" };
}

export async function sendContact(input: ContactInput, reference: string): Promise<DeliveryResult> {
  assertProductionConfiguration();
  if (!sendGridConfigured || !config.SENDGRID_CONTACT_TO_EMAIL) return { mode: "mock" };

  const from = { email: config.SENDGRID_FROM_EMAIL!, name: config.SENDGRID_FROM_NAME };
  await mail.send([
    {
      to: config.SENDGRID_CONTACT_TO_EMAIL,
      from,
      replyTo: input.email,
      subject: `[${reference}] ${input.inquiryType}: ${input.subject}`,
      text: `Reference: ${reference}\nType: ${input.inquiryType}\nPreferred reply language: ${input.preferredLanguage}\nName: ${input.name || "Not provided"}\nReply email: ${input.email}\n\n${input.message}`,
    },
    {
      to: input.email,
      from,
      subject: `We received your message — ${reference}`,
      text: `Thank you for contacting Pangea Games. Your reference is ${reference}. We will reply to this email address when we have reviewed your message.`,
    },
  ]);
  return { mode: "sendgrid" };
}

export async function sendSupport(input: SupportInput, reference: string): Promise<DeliveryResult> {
  assertProductionConfiguration();
  if (!sendGridConfigured || !config.SENDGRID_SUPPORT_TO_EMAIL) return { mode: "mock" };

  const from = { email: config.SENDGRID_FROM_EMAIL!, name: config.SENDGRID_FROM_NAME };
  await mail.send([
    {
      to: config.SENDGRID_SUPPORT_TO_EMAIL,
      from,
      replyTo: input.email,
      subject: `[${reference}] ${input.category}: ${input.subject}`,
      text: `Reference: ${reference}\nCategory: ${input.category}\nPlatform: ${input.platform}\nPreferred reply language: ${input.preferredLanguage}\nGame version: ${input.gameVersion || "Not provided"}\nName: ${input.name || "Not provided"}\nReply email: ${input.email}\n\n${input.message}`,
    },
    {
      to: input.email,
      from,
      subject: `Support request received — ${reference}`,
      text: `Thank you for contacting Pangea Games support. Your reference is ${reference}. Keep this reference if you need to follow up.`,
    },
  ]);
  return { mode: "sendgrid" };
}

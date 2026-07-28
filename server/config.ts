import { z } from "zod";

const optionalEmail = z.union([z.literal(""), z.string().email()]).optional();

const schema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(3000),
  PUBLIC_ORIGIN: z.string().url().default("http://localhost:3000"),
  SENDGRID_API_KEY: z.string().optional(),
  SENDGRID_FROM_EMAIL: optionalEmail,
  SENDGRID_FROM_NAME: z.string().default("Pangea Games"),
  SENDGRID_CONTACT_TO_EMAIL: optionalEmail,
  SENDGRID_SUPPORT_TO_EMAIL: optionalEmail,
  SENDGRID_NEWSLETTER_LIST_ID: z.string().optional(),
  SENDGRID_LANGUAGE_FIELD_ID: z.string().optional(),
  TRUST_PROXY: z.coerce.number().int().min(0).default(1),
});

export const config = schema.parse(process.env);
export const sendGridConfigured = Boolean(
  config.SENDGRID_API_KEY && config.SENDGRID_FROM_EMAIL,
);

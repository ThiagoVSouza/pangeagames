import { z } from "zod";

const email = z.string().trim().email().max(254);
const safeLine = z.string().trim().min(2).max(160).regex(/^[^\r\n]+$/);
const message = z.string().trim().min(10).max(5_000);
const language = z.enum(["en", "pt-BR", "zh-CN", "ru", "es", "de", "nl", "fr", "it", "pt-PT", "ja", "ko", "pl", "zh-TW", "tr", "sv", "da", "hi", "fi", "nb", "cs", "hu", "th", "uk"]);

const botFields = {
  website: z.string().max(0).optional().default(""),
  startedAt: z.coerce.number().int().positive(),
};

export const newsletterSchema = z.object({
  email,
  consent: z.literal("on"),
  locale: z.string().regex(/^[A-Za-z]{2,3}(?:-[A-Za-z0-9]{2,8})?$/).default("en"),
  ...botFields,
});

export const contactSchema = z.object({
  inquiryType: z.enum(["general", "business", "press", "privacy", "accessibility"]),
  preferredLanguage: language.default("en"),
  name: z.string().trim().max(100).optional().default(""),
  email,
  subject: safeLine,
  message,
  ...botFields,
});

export const supportSchema = z.object({
  category: z.enum(["technical", "gameplay", "accessibility", "purchase", "privacy", "other"]),
  platform: z.enum(["windows", "macos", "android", "ios", "other"]),
  preferredLanguage: language.default("en"),
  name: z.string().trim().max(100).optional().default(""),
  email,
  subject: safeLine,
  message,
  gameVersion: z.string().trim().max(50).optional().default(""),
  ...botFields,
});

export type NewsletterInput = z.infer<typeof newsletterSchema>;
export type ContactInput = z.infer<typeof contactSchema>;
export type SupportInput = z.infer<typeof supportSchema>;

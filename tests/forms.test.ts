import { describe, expect, it } from "vitest";
import { contactSchema, newsletterSchema, supportSchema } from "../server/validation/forms.js";

const startedAt = Date.now() - 5_000;

describe("form validation", () => {
  it("accepts a newsletter subscription", () => {
    expect(newsletterSchema.parse({ email: "player@example.com", consent: "on", locale: "en", startedAt }).email).toBe("player@example.com");
  });

  it("rejects invalid email addresses", () => {
    expect(() => newsletterSchema.parse({ email: "wrong", consent: "on", locale: "en", startedAt })).toThrow();
  });

  it("accepts contact and support requests", () => {
    expect(contactSchema.parse({ inquiryType: "press", preferredLanguage: "pt-BR", email: "press@example.com", subject: "Preview inquiry", message: "Could we discuss the game?", startedAt }).preferredLanguage).toBe("pt-BR");
    expect(supportSchema.parse({ category: "technical", platform: "windows", preferredLanguage: "ja", email: "player@example.com", subject: "Startup issue", message: "The game does not start after updating.", startedAt }).preferredLanguage).toBe("ja");
  });
});

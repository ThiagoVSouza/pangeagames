import { randomBytes } from "node:crypto";
import { Router, type Request, type Response } from "express";
import { ZodError, type ZodType } from "zod";
import { rateLimit } from "../middleware/rateLimit.js";
import { sendContact, sendSupport, subscribe } from "../services/sendgrid.js";
import { contactSchema, newsletterSchema, supportSchema } from "../validation/forms.js";

export const formsRouter = Router();
formsRouter.use(rateLimit({ limit: 8, windowMs: 15 * 60 * 1000 }));

function reference(prefix: string) {
  return `${prefix}-${randomBytes(4).toString("hex").toUpperCase()}`;
}

function isSuspicious(startedAt: number) {
  const elapsed = Date.now() - startedAt;
  return elapsed < 1_500 || elapsed > 24 * 60 * 60 * 1000;
}

async function handle<T>(
  request: Request,
  response: Response,
  schema: ZodType<T>,
  action: (input: T) => Promise<Record<string, unknown>>,
) {
  try {
    const input = schema.parse(request.body);
    const botInput = input as { website?: string; startedAt: number };
    if (botInput.website || isSuspicious(botInput.startedAt)) {
      response.status(202).json({ ok: true });
      return;
    }
    const result = await action(input);
    response.status(200).json({ ok: true, ...result });
  } catch (error) {
    if (error instanceof ZodError) {
      response.status(400).json({ ok: false, code: "invalid_request" });
      return;
    }
    console.error("Form delivery failed", error instanceof Error ? error.message : "Unknown error");
    response.status(503).json({ ok: false, code: "service_unavailable" });
  }
}

formsRouter.post("/newsletter", (request, response) =>
  handle(request, response, newsletterSchema, async (input) => {
    await subscribe(input);
    return {};
  }),
);

formsRouter.post("/contact", (request, response) =>
  handle(request, response, contactSchema, async (input) => {
    const id = reference("PGC");
    await sendContact(input, id);
    return { reference: id };
  }),
);

formsRouter.post("/support", (request, response) =>
  handle(request, response, supportSchema, async (input) => {
    const id = reference("PGS");
    await sendSupport(input, id);
    return { reference: id };
  }),
);

import type { RequestHandler } from "express";

type Entry = { count: number; resetAt: number };
const requests = new Map<string, Entry>();

export function rateLimit(options: { limit: number; windowMs: number }): RequestHandler {
  return (request, response, next) => {
    const now = Date.now();
    const key = `${request.path}:${request.ip ?? "unknown"}`;
    const entry = requests.get(key);

    if (!entry || entry.resetAt <= now) {
      requests.set(key, { count: 1, resetAt: now + options.windowMs });
      next();
      return;
    }

    if (entry.count >= options.limit) {
      response.setHeader("Retry-After", Math.ceil((entry.resetAt - now) / 1000));
      response.status(429).json({ ok: false, code: "rate_limited" });
      return;
    }

    entry.count += 1;
    next();
  };
}

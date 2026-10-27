import path from "node:path";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import express from "express";
import helmet from "helmet";
import { config } from "./config.js";
import { formsRouter } from "./routes/forms.js";
import { siteLocale, supportedSiteLocale } from "./i18n.js";

const directory = path.dirname(fileURLToPath(import.meta.url));
// In development this file lives in `server/`; after compilation it lives in
// `dist/server/`. Pick the nearest ancestor containing the site's public files
// so both layouts work, regardless of the process working directory.
const root = [path.resolve(directory, ".."), path.resolve(directory, "../..")]
  .find((candidate) => existsSync(path.join(candidate, "public", "404.html")));

if (!root) {
  throw new Error(`Could not locate the public directory from ${directory}`);
}
const publicDirectory = path.join(root, "public");

export const app = express();
app.set("trust proxy", config.TRUST_PROXY);
app.disable("x-powered-by");
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      imgSrc: ["'self'", "data:"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'"],
      fontSrc: ["'self'"],
      connectSrc: ["'self'"],
      frameAncestors: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: false,
}));
app.use(express.json({ limit: "32kb" }));
app.use(express.urlencoded({ extended: false, limit: "32kb" }));

app.get("/health", (_request, response) => response.json({ status: "ok" }));
app.use("/api", formsRouter);
app.get("/", (_request, response) => response.sendFile(path.join(publicDirectory, "index.html")));
app.use(express.static(publicDirectory, {
  extensions: ["html"],
  maxAge: config.NODE_ENV === "production" ? "1h" : 0,
  setHeaders(response, filePath) {
    const locale = supportedSiteLocale(path.relative(publicDirectory, filePath).split(path.sep)[0]);
    if (locale) response.setHeader("Content-Language", locale);
    if (/\.[a-f0-9]{8,}\./.test(filePath)) response.setHeader("Cache-Control", "public, max-age=31536000, immutable");
  },
}));
app.use((request, response) => {
  let preference: string | undefined;
  try { preference = decodeURIComponent(request.headers.cookie?.split(";").map(value => value.trim()).find(value => value.startsWith("pangea_locale="))?.slice(14) || ""); } catch { /* Ignore malformed preference cookies. */ }
  const locale = supportedSiteLocale(request.path.split("/")[1]) || siteLocale(preference);
  response.setHeader("Content-Language", locale);
  response.status(404).sendFile(path.join(publicDirectory, locale, "404.html"));
});

if (process.env.NODE_ENV !== "test") {
  app.listen(config.PORT, "0.0.0.0", () => {
    console.log(`Pangea Games listening on port ${config.PORT}`);
  });
}

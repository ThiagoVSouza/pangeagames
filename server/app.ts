import path from "node:path";
import { fileURLToPath } from "node:url";
import express from "express";
import helmet from "helmet";
import { config } from "./config.js";
import { formsRouter } from "./routes/forms.js";

const directory = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(directory, "../..");
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
app.get("/", (_request, response) => response.redirect(302, "/en/"));
app.use(express.static(publicDirectory, {
  extensions: ["html"],
  maxAge: config.NODE_ENV === "production" ? "1h" : 0,
  setHeaders(response, filePath) {
    if (/\.[a-f0-9]{8,}\./.test(filePath)) response.setHeader("Cache-Control", "public, max-age=31536000, immutable");
  },
}));
app.use((_request, response) => response.status(404).sendFile(path.join(publicDirectory, "404.html")));

if (process.env.NODE_ENV !== "test") {
  app.listen(config.PORT, "0.0.0.0", () => {
    console.log(`Pangea Games listening on port ${config.PORT}`);
  });
}

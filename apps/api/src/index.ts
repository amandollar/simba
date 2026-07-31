import "dotenv/config";
import cors, { type CorsOptions } from "cors";
import express from "express";
import { clerkMiddleware } from "@clerk/express";
import { auditsRouter, fixesRouter } from "./routes/audits.js";
import { consultantRouter } from "./routes/consultant.js";
import { growthRouter } from "./routes/growth.js";
import { issuesRouter } from "./routes/issues.js";
import { merchantRouter } from "./routes/merchant.js";
import { publicRouter } from "./routes/public.js";
import { storeRouter } from "./routes/store.js";
import { toClientError } from "./lib/client-error.js";
import { isCorsOriginAllowed, logCorsRejection } from "./lib/cors-origins.js";

const app = express();
const port = Number(process.env.PORT ?? 4000);

const corsOptions: CorsOptions = {
  origin(origin, callback) {
    const allowed = isCorsOriginAllowed(origin);
    if (!allowed && origin) logCorsRejection(origin);
    callback(null, allowed);
  },
  methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));
app.use(express.json());
app.use(clerkMiddleware());

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/merchant", merchantRouter);
app.use("/audits", auditsRouter);
app.use("/fixes", fixesRouter);
app.use("/issues", issuesRouter);
app.use("/growth", growthRouter);
app.use("/consultant", consultantRouter);
app.use("/public", publicRouter);
app.use("/store", storeRouter);

// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ error: toClientError(err) });
});

app.listen(port, "0.0.0.0", () => {
  console.log(`Simba API listening on port ${port}`);
});

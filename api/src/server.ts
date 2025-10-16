// api/src/server.ts
import "dotenv/config";
import express, { Request, Response } from "express";
import cors from "cors";

import health from "./routes/health.js";
import memory from "./routes/memory.js";
import rag from "./routes/rag.js";
import snapshots from "./routes/snapshots.js";
import sessions from "./routes/sessions.js";
import trades from "./routes/trades.js";
import alerts from "./routes/alerts.js";
import memoryItems from "./routes/memory_items.js";
import boot from "./routes/boot.js";
import { requireApiKey } from "./util/auth.js";

const app = express();

// middleware
app.use(cors());
app.use(express.json({ limit: "10mb" }));

// public routes first
app.use(health);

// require API key for everything else
app.use(requireApiKey);

// secured routes
app.use(memory);
app.use(rag);
app.use(snapshots);
app.use(sessions);
app.use(memoryItems);
app.use(trades);
app.use(alerts);
app.use(boot);

// default redirects / and silences favicon
app.get("/", (_req: Request, res: Response) => res.redirect("/health"));
app.get(["/favicon.ico", "/favicon.png"], (_req: Request, res: Response) =>
  res.status(204).end()
);

export default app; // no app.listen() needed on Vercel

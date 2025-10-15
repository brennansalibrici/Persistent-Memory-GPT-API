// api/src/routes/health.ts
import { Router, Request, Response } from "express";
import { query } from "../db.js";

const r = Router();

// Simple health
r.get("/health", (_req: Request, res: Response) => res.json({ ok: true }));

// Database ping
r.get("/dbping", async (_req: Request, res: Response) => {
  try {
    const t0 = Date.now();
    const out = await query("select 1 as ok");
    res.json({ ok: out.rows?.[0]?.ok === 1, ms: Date.now() - t0 });
  } catch (e: any) {
    console.error("dbping error:", e?.message || e);
    res.status(500).json({ ok: false, error: String(e?.message || e) });
  }
});

export default r;

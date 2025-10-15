// api/src/routes/memory.ts
import { Router, Request, Response } from "express";
import { query } from "../db.js";
import { apiKeyAuth } from "../util/auth.js";

const r = Router();
r.use(apiKeyAuth);

/**
 * POST /memory
 * Body: { user_external_id: string, note: string, tags?: string[], importance?: number }
 */
r.post("/memory", async (req: Request, res: Response) => {
  const { user_external_id, note, tags = [], importance = 1 } = req.body || {};

  if (!user_external_id) {
    return res.status(400).json({ ok: false, error: '"user_external_id" is required' });
  }
  if (!note) {
    return res.status(400).json({ ok: false, error: '"note" is required' });
  }

  const insert = await query(
    `insert into memory_notes (user_external_id, note, tags, importance)
     values ($1,$2,$3,$4)
     returning id, created_at`,
    [user_external_id, note, tags, importance]
  );

  const row = insert.rows[0];
  return res.json({ ok: true, id: row.id, created_at: row.created_at });
});

/**
 * GET /memory?user_external_id=...&limit=25
 * Returns newest-first for that user.
 */
r.get("/memory", async (req: Request, res: Response) => {
  const { user_external_id, limit = 25 } = req.query as any;

  if (!user_external_id) {
    return res.status(400).json({ ok: false, error: '"user_external_id" is required' });
  }

  // prevent caches for user data
  res.set("Cache-Control", "no-store");

  const q = await query(
    `select id, user_external_id, note, tags, importance, created_at
     from memory_notes
     where user_external_id = $1
     order by created_at desc
     limit $2`,
    [user_external_id, Number(limit)]
  );

  return res.json(q.rows); // array (unchanged)
});

/**
 * GET /rehydrate?user_external_id=...&n=20
 * Builds a compact string of top-N memories by importance desc, then newest.
 */
r.get("/rehydrate", async (req: Request, res: Response) => {
  const { user_external_id, n = 20 } = req.query as any;

  if (!user_external_id) {
    return res.status(400).json({ ok: false, error: '"user_external_id" is required' });
  }

  res.set("Cache-Control", "no-store");

  const q = await query(
    `select note
     from memory_notes
     where user_external_id = $1
     order by importance desc, created_at desc
     limit $2`,
    [user_external_id, Number(n)]
  );

  const context = q.rows.map((r: any) => `• ${r.note}`).join("\n");
  return res.json({ ok: true, context });
});

export default r;

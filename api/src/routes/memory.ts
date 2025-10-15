// api/src/routes/memory.ts
import { Router, Request, Response } from "express";
import { query } from "../db.js";
import { apiKeyAuth } from "../util/auth.js";

const r = Router();
r.use(apiKeyAuth);

// create a memory
r.post("/memory", async (req: Request, res: Response) => {
  const { user_external_id, note, tags = [], importance = 1 } = req.body || {};
  if (!user_external_id)
    return res.status(400).json({ ok: false, error: '"user_external_id" is required' });
  if (!note)
    return res.status(400).json({ ok: false, error: '"note" is required' });

  await query(
    "insert into memory_notes(user_external_id, note, tags, importance) values ($1,$2,$3,$4)",
    [user_external_id, note, tags, importance]
  );

  res.json({ ok: true });
});

// list memories
r.get("/memory", async (req: Request, res: Response) => {
  const { user_external_id, limit = 25 } = req.query as any;
  if (!user_external_id)
    return res.status(400).json({ ok: false, error: '"user_external_id" is required' });

  const q = await query(
    "select * from memory_notes where user_external_id=$1 order by created_at desc limit $2",
    [user_external_id, Number(limit)]
  );

  res.json(q.rows);
});

// rehydrate top-N notes
r.get("/rehydrate", async (req: Request, res: Response) => {
  const { user_external_id, n = 20 } = req.query as any;
  if (!user_external_id)
    return res.status(400).json({ ok: false, error: '"user_external_id" is required' });

  const q = await query(
    "select note from memory_notes where user_external_id=$1 order by created_at desc limit $2",
    [user_external_id, Number(n)]
  );

  const context = q.rows.map((r: any) => `• ${r.note}`).join("\n");
  res.json({ ok: true, context });
});

export default r;

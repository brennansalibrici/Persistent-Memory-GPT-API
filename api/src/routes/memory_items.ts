// api/src/routes/memory_items.ts
import { Router, Request, Response } from "express";
import { query } from "../db.js";
import { apiKeyAuth } from "../util/auth.js";

const r = Router();
r.use(apiKeyAuth);

// ---- helpers ---------------------------------------------------------------

function toJsonbArray(v: unknown): string {
  if (v == null) return "[]";
  if (typeof v === "string") return JSON.stringify([v]);
  if (Array.isArray(v)) return JSON.stringify(v);
  return JSON.stringify([v]);
}

type TextRow = { text: string };

// ---- routes ----------------------------------------------------------------

/**
 * POST /memory/item
 */
r.post("/memory/item", async (req: Request, res: Response) => {
  const {
    user_external_id,
    type,
    text,
    subject = null,
    entities = [],
    tags = [],
    importance = 1,
    source_gpt = null,
    conversation_id = null,
  } = req.body || {};

  if (!user_external_id)
    return res.status(400).json({ ok: false, error: '"user_external_id" is required' });
  if (!type || !["structural", "semantic", "episodic"].includes(type))
    return res
      .status(400)
      .json({ ok: false, error: '"type" must be structural|semantic|episodic' });
  if (!text)
    return res.status(400).json({ ok: false, error: '"text" is required' });

  const entitiesJson = toJsonbArray(entities);
  const tagsJson = toJsonbArray(tags);

  const insert = await query(
    `insert into memory_items
       (user_external_id, type, text, subject, entities, tags, importance, source_gpt, conversation_id)
     values ($1,$2,$3,$4,$5::jsonb,$6::jsonb,$7,$8,$9)
     returning id, created_at`,
    [
      user_external_id,
      type,
      text,
      subject,
      entitiesJson,
      tagsJson,
      Number(importance),
      source_gpt,
      conversation_id,
    ]
  );

  const row = insert.rows[0];
  return res.json({ ok: true, id: row.id, created_at: row.created_at });
});

/**
 * GET /memory/items?user_external_id=...&types=semantic,episodic&tags=trading,relationship&limit=50
 */
r.get("/memory/items", async (req: Request, res: Response) => {
  const { user_external_id } = req.query as any;
  let { types, tags, limit = 50 } = req.query as any;

  if (!user_external_id)
    return res.status(400).json({ ok: false, error: '"user_external_id" is required' });

  res.set("Cache-Control", "no-store");

  const typesArr = typeof types === "string" ? types.split(",").map((s) => s.trim()).filter(Boolean) : [];
  const tagsArr = typeof tags === "string" ? tags.split(",").map((s) => s.trim()).filter(Boolean) : [];

  const where: string[] = ["user_external_id = $1"];
  const params: any[] = [user_external_id];
  let i = 2;

  if (typesArr.length) {
    where.push(`type = any($${i}::text[])`);
    params.push(typesArr);
    i++;
  }
  if (tagsArr.length) {
    // match if ANY of the provided tags exist in the jsonb array
    where.push(`jsonb_exists_any(tags, $${i}::text[])`);
    params.push(tagsArr);
    i++;
  }

  const q = await query(
    `select id, type, text, subject, entities, tags, importance, source_gpt, conversation_id, created_at
       from memory_items
      where ${where.join(" and ")}
      order by importance desc, created_at desc
      limit $${i}`,
    [...params, Number(limit)]
  );

  return res.json(q.rows);
});

/**
 * GET /rehydrate2?user_external_id=...&n=20
 */
r.get("/rehydrate2", async (req: Request, res: Response) => {
  const { user_external_id, n = 20 } = req.query as any;

  if (!user_external_id)
    return res.status(400).json({ ok: false, error: '"user_external_id" is required' });

  res.set("Cache-Control", "no-store");

  const structuralRes = await query(
    `select text from memory_items
      where user_external_id=$1 and type='structural'
      order by importance desc, created_at desc
      limit 5`,
    [user_external_id]
  );

  const structuralRows = (structuralRes.rows ?? []) as TextRow[];

  const restRes = await query(
    `select text from memory_items
      where user_external_id=$1 and type in ('semantic','episodic')
      order by importance desc, created_at desc
      limit $2`,
    [user_external_id, Math.max(0, Number(n) - structuralRows.length)]
  );

  const restRows = (restRes.rows ?? []) as TextRow[];

  const bullets = [
    ...structuralRows.map((r: TextRow) => `• ${r.text}`),
    ...restRows.map((r: TextRow) => `• ${r.text}`),
  ].slice(0, Number(n));

  return res.json({ ok: true, context: bullets.join("\n") });
});

export default r;

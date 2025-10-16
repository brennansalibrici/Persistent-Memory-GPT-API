// api/src/routes/boot.ts
import { Router, Request, Response } from "express";
import { query } from "../db.js";

const r = Router();

/**
 * GET /boot/rehydrate?user_external_id=brennan&source_gpt=ChatGPT%20Mastery%20GPT&n=20
 *
 * Automatically performs the startup memory hydration.
 */
r.get("/boot/rehydrate", async (req: Request, res: Response) => {
  const { user_external_id, source_gpt = null, n = 20 } = req.query as any;

  if (!user_external_id)
    return res.status(400).json({ ok: false, error: '"user_external_id" is required' });

  try {
    // Fetch all structural items
    const structuralRes = await query(
      `select id, type, text, subject, entities, tags, importance, source_gpt, conversation_id, created_at
         from memory_items
        where user_external_id=$1 and type='structural'
        order by importance desc, created_at desc`,
      [user_external_id]
    );

    // Fetch semantic/episodic items scoped to GPT
    const scopedRes = await query(
      `select id, type, text, subject, entities, tags, importance, source_gpt, conversation_id, created_at
         from memory_items
        where user_external_id=$1
          and type in ('semantic','episodic')
          and ($2::text is null or source_gpt=$2)
        order by created_at desc, importance desc
        limit $3`,
      [user_external_id, source_gpt, Number(n)]
    );

    const structural = structuralRes.rows ?? [];
    const scoped = scopedRes.rows ?? [];
    const all = [...structural, ...scoped];

    res.json({
      ok: true,
      count: all.length,
      context: all.map((r: any) => `• ${r.text}`).join("\n"),
      items: all
    });
  } catch (err: any) {
    console.error("Boot rehydrate error:", err);
    res.status(500).json({ ok: false, error: err.message });
  }
});

export default r;

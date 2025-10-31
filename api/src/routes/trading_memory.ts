// /api/src/routes/trading_memory.ts
import express from "express";
import { query } from "../db.js";

const router = express.Router();

/**
 * POST /api/trading-memory
 */
router.post("/api/trading-memory", async (req, res) => {
  const { type, branch_id, mode_id, lesson_id, content, summary } = req.body;

  try {
    let table: string;
    switch (type) {
      case "semantic":
        table = "trading_knowledge";
        break;
      case "episodic":
        table = "trading_autosaves";
        break;
      case "structural":
        table = "trading_branches";
        break;
      default:
        return res.status(400).json({ ok: false, error: "Invalid type" });
    }

    // ✅ Use your real column names
    const text = `
      insert into ${table} (branch_id, mode_id, lesson_id, content, summary, created_at)
      values ($1, $2, $3, $4, $5, now())
      returning *;
    `;
    const params = [branch_id || null, mode_id || null, lesson_id || null, content, summary || null];

    const result = await query(text, params);
    res.status(200).json({ ok: true, data: result.rows });
  } catch (err: any) {
    console.error("Trading memory error:", err.message);
    res.status(500).json({ ok: false, error: err.message });
  }
});

/**
 * GET /api/trading-memory
 * Retrieve trading memories filtered by branch / mode / type.
 * Query params: type, branch_id, mode_id, limit
 */
router.get("/api/trading-memory", async (req, res) => {
  const { type, branch_id, mode_id, limit = 10 } = req.query;

  try {
    let table: string;
    switch (type) {
      case "semantic":
        table = "trading_knowledge";
        break;
      case "episodic":
        table = "trading_autosaves";
        break;
      case "structural":
        table = "trading_branches";
        break;
      default:
        return res.status(400).json({ ok: false, error: "Invalid type" });
    }

    // Build WHERE conditions dynamically
    const where: string[] = [];
    const params: any[] = [];

    if (branch_id) {
      params.push(branch_id);
      where.push(`branch_id = $${params.length}`);
    }
    if (mode_id) {
      params.push(mode_id);
      where.push(`mode_id = $${params.length}`);
    }

    const whereClause = where.length ? `where ${where.join(" and ")}` : "";
    params.push(limit);

    const text = `
      select * from ${table}
      ${whereClause}
      order by created_at desc
      limit $${params.length};
    `;

    const result = await query(text, params);
    res.status(200).json({ ok: true, data: result.rows });
  } catch (err: any) {
    console.error("Trading memory retrieval error:", err.message);
    res.status(500).json({ ok: false, error: err.message });
  }
});

export default router;

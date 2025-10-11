import { Router } from 'express';
import { query } from '../db.js';
import { apiKeyAuth } from '../util/auth.js';

const r = Router();
r.use(apiKeyAuth);

r.post('/log_trade', async (req, res) => {
  const { user_external_id, session_id, symbol, side, tf, entry_time, exit_time, entry_price, exit_price, qty, rationale, outcome } = req.body || {};
  if (!user_external_id || !symbol || !side) return res.status(400).json({ error: 'missing fields' });
  const out = await query(
    `insert into trades(user_external_id, session_id, symbol, side, tf, entry_time, exit_time, entry_price, exit_price, qty, rationale, outcome)
     values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) returning *`,
    [user_external_id, session_id || null, symbol, side, tf || null, entry_time || null, exit_time || null, entry_price || null, exit_price || null, qty || null, rationale || null, outcome || null]
  );
  res.json(out.rows[0]);
});

r.get('/trades', async (req, res) => {
  const { user_external_id, limit = 50 } = req.query as any;
  if (!user_external_id) return res.status(400).json({ error: 'missing user_external_id' });
  const q = await query('select * from trades where user_external_id=$1 order by created_at desc limit $2', [user_external_id, Number(limit)]);
  res.json(q.rows);
});

export default r;
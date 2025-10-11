import { Router } from 'express';
import { query } from '../db.js';
import { apiKeyAuth } from '../util/auth.js';

const r = Router();
r.use(apiKeyAuth);

r.post('/start_session', async (req, res) => {
  const { user_external_id, title } = req.body || {};
  if (!user_external_id) return res.status(400).json({ error: 'missing user_external_id' });
  const out = await query('insert into trade_sessions(user_external_id, title) values ($1,$2) returning *', [user_external_id, title || null]);
  res.json(out.rows[0]);
});

r.post('/end_session', async (req, res) => {
  const { id } = req.body || {};
  if (!id) return res.status(400).json({ error: 'missing id' });
  const out = await query('update trade_sessions set ended_at = now() where id=$1 returning *', [id]);
  res.json(out.rows[0]);
});

export default r;
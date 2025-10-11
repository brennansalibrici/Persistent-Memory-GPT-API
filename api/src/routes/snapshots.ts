import { Router } from 'express';
import { query } from '../db.js';
import { apiKeyAuth } from '../util/auth.js';

const r = Router();
r.use(apiKeyAuth);

r.post('/store_snapshot', async (req, res) => {
  const { user_external_id, symbol, timeframe, title, tv_url, image_url, tags = [], notes } = req.body || {};
  if (!user_external_id || !tv_url) return res.status(400).json({ error: 'missing fields' });
  await query(
    `insert into tv_snapshots(user_external_id, symbol, timeframe, title, tv_url, image_url, tags, notes)
     values ($1,$2,$3,$4,$5,$6,$7,$8)`,
    [user_external_id, symbol, timeframe, title, tv_url, image_url, tags, notes]
  );
  res.json({ ok: true });
});

r.get('/list_snapshots', async (req, res) => {
  const { user_external_id, symbol, timeframe, limit = 50 } = req.query as any;
  if (!user_external_id) return res.status(400).json({ error: 'missing user_external_id' });
  const params: any[] = [user_external_id];
  let where = 'user_external_id=$1';
  if (symbol) { params.push(symbol); where += ` and symbol=$${params.length}`; }
  if (timeframe) { params.push(timeframe); where += ` and timeframe=$${params.length}`; }
  params.push(Number(limit));
  const q = await query(`select * from tv_snapshots where ${where} order by created_at desc limit $${params.length}`, params);
  res.json(q.rows);
});

export default r;   
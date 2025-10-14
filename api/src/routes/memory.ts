import { Router } from 'express';
import { query } from '../db.js';
import { apiKeyAuth  } from '../util/auth.js';

const r = Router();
r.use(apiKeyAuth);

r.post('/memory', async (req, res) => {
  const { user_external_id, note, tags = [], importance = 1 } = req.body || {};
  if (!user_external_id || !note) return res.status(400).json({ error: 'missing fields' });
  await query(
    'insert into memory_notes(user_external_id, note, tags, importance) values ($1,$2,$3,$4)',
    [user_external_id, note, tags, importance]
  );
  res.json({ ok: true });
});

r.get('/memory', async (req, res) => {
  const { user_external_id, limit = 25 } = req.query as any;
  if (!user_external_id) return res.status(400).json({ error: 'missing user_external_id' });
  const q = await query(
    'select * from memory_notes where user_external_id=$1 order by created_at desc limit $2',
    [user_external_id, Number(limit)]
  );
  res.json(q.rows);
});

r.get('/rehydrate', async (req, res) => {
  const { user_external_id, n = 20 } = req.query as any;
  if (!user_external_id) return res.status(400).json({ error: 'missing user_external_id' });
  const q = await query(
    'select * from memory_notes where user_external_id=$1 order by created_at desc limit $2',
    [user_external_id, Number(n)]
  );
  res.json(q.rows);
});

export default r;

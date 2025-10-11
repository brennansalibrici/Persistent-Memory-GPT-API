import { Router } from 'express';
import { query } from '../db.js';

const r = Router();

// Optionally protect with a secret in the URL or header from TradingView webhook settings
r.post('/alert', async (req, res) => {
  const secret = req.header('x-tv-secret');
  if (process.env.TV_WEBHOOK_SECRET && secret !== process.env.TV_WEBHOOK_SECRET) {
    return res.status(401).json({ error: 'unauthorized' });
  }
  const { user_external_id, symbol, timeframe, payload } = req.body || {};
  if (!user_external_id || !symbol) return res.status(400).json({ error: 'missing fields' });
  await query(
    'insert into chart_marks(user_external_id, symbol, timeframe, kind, payload) values ($1,$2,$3,$4,$5)',
    [user_external_id, symbol, timeframe || 'unknown', 'alert', payload || {}]
  );
  res.json({ ok: true });
});

export default r;
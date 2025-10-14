import 'dotenv/config';
import express from 'express';
import cors from 'cors';

import health from './routes/health.js';
import memory from './routes/memory.js';
import rag from './routes/rag.js';
import snapshots from './routes/snapshots.js';
import sessions from './routes/sessions.js';
import trades from './routes/trades.js';
import alerts from './routes/alerts.js';

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.get("/health", (_req, res) => res.json({ ok: true }));

app.use(health);
app.use(memory);
app.use(rag);
app.use(snapshots);
app.use(sessions);
app.use(trades);
app.use(alerts);

app.get('/', (_req, res) => res.redirect('/health'));

export default app; // (no app.listen on Vercel)

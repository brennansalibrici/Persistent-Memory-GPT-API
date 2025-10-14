import 'dotenv/config';
import express from 'express';
import cors from 'cors';

import health from './routes/health';
import memory from './routes/memory';
import rag from './routes/rag';
import snapshots from './routes/snapshots';
import sessions from './routes/sessions';
import trades from './routes/trades';
import alerts from './routes/alerts';

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));

app.use(health);
app.use(memory);
app.use(rag);
app.use(snapshots);
app.use(sessions);
app.use(trades);
app.use(alerts);

app.get('/', (_req, res) => res.redirect('/health'));

// ❌ Do NOT call app.listen() on Vercel.
// ✅ Export the Express app as the default handler instead.
export default app;

import { Router } from 'express';
import { query } from '../db.js';
import { apiKeyAuth } from '../util/auth.js';
import { chunkText } from '../util/chunk.js';
import { embed } from '../openai.js';

const r = Router();
r.use(apiKeyAuth);

r.post('/ingest', async (req, res) => {
  const { user_external_id, source, text, image_urls = [], tags = [] } = req.body || {};
  if (!user_external_id || !text) return res.status(400).json({ error: 'missing fields' });

  const chunks = chunkText(text);
  const embeddings = await embed(chunks);

  const values = [] as any[];
  const params = [] as any[];
  let i = 1;

  chunks.forEach((chunk, idx) => {
    const emb = embeddings[idx];
    params.push(user_external_id, source || null, chunk, emb, image_urls, tags);
    values.push(`($${i++}, $${i++}, $${i++}, $${i++}::vector, $${i++}, $${i++})`);
  });

  const sql = `insert into course_chunks (user_external_id, source, chunk, embedding, image_urls, tags)
               values ${values.join(',')}`;
  await query(sql, params);
  res.json({ ok: true, chunks: chunks.length });
});

r.post('/search', async (req, res) => {
  const { user_external_id, query: q, top_k = 8 } = req.body || {};
  if (!user_external_id || !q) return res.status(400).json({ error: 'missing fields' });
  const [emb] = await embed([q]);

  const sql = `
    select id, source, chunk, image_urls, tags, created_at,
           1 - (embedding <=> $1::vector) as score
    from course_chunks
    where user_external_id = $2
    order by embedding <-> $1::vector
    limit $3`;
  const out = await query(sql, [emb, user_external_id, top_k]);
  res.json(out.rows);
});

r.post("/rag/embed", async (req, res, next) => {
  try {
    const { text } = req.body ?? {};
    if (!text) return res.status(400).json({ error: "text is required" });
    const [vector] = await embed(text);
    res.json({ dims: vector.length, vector });
  } catch (err) {
    next(err);
  }
});

export default r;

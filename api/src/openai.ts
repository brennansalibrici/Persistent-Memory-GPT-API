import OpenAI from 'openai';

let client: OpenAI | null = null;

function getClient(): OpenAI {
  if (!client) {
    const key = process.env.OPENAI_API_KEY;
    if (!key) {
      throw new Error('OPENAI_API_KEY is not set on the server');
    }
    client = new OpenAI({ apiKey: key });
  }
  return client;
}

export async function embed(texts: string[]): Promise<number[][]> {
  const openai = getClient();
  const res = await openai.embeddings.create({
    model: process.env.EMBEDDING_MODEL || 'text-embedding-3-small',
    input: texts
  });
  return res.data.map(d => d.embedding as number[]);
}

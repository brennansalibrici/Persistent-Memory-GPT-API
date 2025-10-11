import OpenAI from 'openai';
export const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function embed(texts: string[]): Promise<number[][]> {
  const res = await openai.embeddings.create({
    model: process.env.EMBEDDING_MODEL || 'text-embedding-3-large',
    input: texts
  });
  return res.data.map(d => d.embedding as number[]);
}
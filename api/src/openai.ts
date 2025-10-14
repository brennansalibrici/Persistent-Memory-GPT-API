// api/src/openai.ts
import OpenAI from "openai";

let _client: OpenAI | null = null;

export function getOpenAI() {
  if (_client) return _client;
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OPENAI_API_KEY is not set");
  _client = new OpenAI({ apiKey });
  return _client;
}

const DEFAULT_EMBED_MODEL = process.env.EMBEDDING_MODEL ?? "text-embedding-3-small";

/** Returns one embedding per input, preserving order */
export async function embed(input: string | string[], model = DEFAULT_EMBED_MODEL) {
  const client = getOpenAI();
  const inputs = Array.isArray(input) ? input : [input];

  const res = await client.embeddings.create({ model, input: inputs });
  // Map to plain number[] arrays
  return res.data.map(d => d.embedding);
}

/** Convenience for a single string (returns number[]) */
export async function embedOne(text: string, model = DEFAULT_EMBED_MODEL) {
  const [vec] = await embed(text, model);
  return vec;
}

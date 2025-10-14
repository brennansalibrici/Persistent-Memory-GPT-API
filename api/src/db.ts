import { Pool } from 'pg';

let pool: Pool | undefined;

function getPool(): Pool {
  if (!pool) {
    const cs = process.env.DATABASE_URL;
    if (!cs) {
      // Do not crash on cold start for non-DB routes like /health
      throw new Error('DATABASE_URL is not set on the server');
    }
    pool = new Pool({
      connectionString: cs,
      // Supabase usually requires SSL in serverless:
      ssl: { rejectUnauthorized: false },
    });
  }
  return pool;
}

export async function query(text: string, params: any[] = []) {
  const client = await getPool().connect();
  try {
    const res = await client.query(text, params);
    return res;
  } finally {
    client.release();
  }
}

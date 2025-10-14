// api/src/db.ts
import { Pool } from 'pg';

let pool: Pool | undefined;

function getPool(): Pool {
  if (!pool) {
    const cs = process.env.DATABASE_URL;
    if (!cs) throw new Error('Missing env var: DATABASE_URL');

    pool = new Pool({
      connectionString: cs,
      // Serverless-friendly settings
      max: 1,                         // keep the pool tiny in lambdas
      idleTimeoutMillis: 30_000,      // close idle quickly
      connectionTimeoutMillis: 5_000, // fail fast instead of hanging
      keepAlive: true,
      // Supabase requires SSL in serverless; also keep ?sslmode=require in the URL
      ssl: { rejectUnauthorized: false },
    });
  }
  return pool;
}

export async function query(text: string, params: any[] = []) {
  const client = await getPool().connect();
  try {
    return await client.query(text, params);
  } finally {
    client.release();
  }
}

// api/src/util/auth.ts
import type { Request, Response, NextFunction } from 'express';

const PUBLIC_PATHS = new Set<string>(['/', '/health', '/favicon.ico', '/favicon.png']);

export function requireApiKey(req: Request, res: Response, next: NextFunction) {
  if (PUBLIC_PATHS.has(req.path)) return next();

  const provided = req.header('x-api-key');
  const expected = process.env.ACTIONS_API_KEY;

  if (!expected) {
    console.error('Missing env var ACTIONS_API_KEY');
    return res.status(500).json({ error: 'Server misconfigured' });
  }
  if (provided !== expected) return res.status(401).json({ error: 'Unauthorized' });

  next();
}

// 👇 re-export under the name your routes expect
export const apiKeyAuth = requireApiKey;

// (optional) default export for flexibility
export default requireApiKey;

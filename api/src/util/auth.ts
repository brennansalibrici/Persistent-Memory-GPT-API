import type { Request, Response, NextFunction } from 'express';

export function apiKeyAuth(req: Request, res: Response, next: NextFunction) {
  const key = req.header('x-api-key');
  if (!process.env.ACTIONS_API_KEY) return res.status(500).json({ error: 'Server misconfigured' });
  if (key !== process.env.ACTIONS_API_KEY) return res.status(401).json({ error: 'Unauthorized' });
  next();
}
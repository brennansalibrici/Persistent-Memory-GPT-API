// api/src/util/auth.ts
import type { Request, Response, NextFunction } from "express";

const PUBLIC_PATHS = new Set<string>([
  "/",
  "/health",
  "/dbping",
  "/favicon.ico",
  "/favicon.png",
]);

export function requireApiKey(req: Request, res: Response, next: NextFunction) {
  // Allow unauthenticated access to health/dbping
  if (PUBLIC_PATHS.has(req.path)) return next();

  const provided = req.header("x-api-key");
  const expected = process.env.ACTIONS_API_KEY;

  if (!expected) {
    console.error("Missing env var ACTIONS_API_KEY");
    return res.status(500).json({ ok: false, error: "Server misconfigured" });
  }

  if (provided !== expected) {
    return res.status(401).json({ ok: false, error: "Unauthorized" });
  }

  next();
}

// re-export under the alias other routes expect
export const apiKeyAuth = requireApiKey;
export default requireApiKey;

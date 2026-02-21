import type { RequestHandler } from 'express';

declare global {
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}

/**
 * Lightweight user identity without auth:
 * - FE generates a stable UUID and sends via `x-user-id`
 * - Optional `x-user-name` for display on leaderboard
 * Backward compatible: defaults to "local".
 */
export const userIdentity: RequestHandler = (req, _res, next) => {
  const id = (req.header('x-user-id') || 'local').trim();
  req.userId = id.length ? id : 'local';
  next();
};

import type { RequestHandler } from 'express';
import { readBearerToken, verifyToken } from './auth.js';

declare global {
  namespace Express {
    interface Request {
      userId?: string;
      authEmail?: string;
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
  const token = readBearerToken(req);
  if (token) {
    try {
      const payload = verifyToken(token);
      req.userId = payload.sub;
      req.authEmail = payload.email;
      return next();
    } catch {
      // ignore invalid token and fallback to x-user-id
    }
  }
  const id = (req.header('x-user-id') || 'local').trim();
  req.userId = id.length ? id : 'local';
  next();
};

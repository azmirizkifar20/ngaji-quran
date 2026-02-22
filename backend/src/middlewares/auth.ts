import type { Request, RequestHandler } from 'express';
import jwt from 'jsonwebtoken';
import { getEnv } from '../config/env.js';

export type AuthPayload = {
  sub: string;
  email: string;
};

declare global {
  namespace Express {
    interface Request {
      authEmail?: string;
    }
  }
}

function getSecret() {
  return getEnv().JWT_SECRET;
}

export function signToken(payload: AuthPayload) {
  return jwt.sign(payload, getSecret(), { expiresIn: '30d' });
}

export function verifyToken(token: string): AuthPayload {
  return jwt.verify(token, getSecret()) as AuthPayload;
}

export function readBearerToken(req: Request): string | null {
  const header = req.header('authorization') || req.header('Authorization');
  if (!header) return null;
  const [type, value] = header.split(' ');
  if (type?.toLowerCase() !== 'bearer' || !value) return null;
  return value.trim();
}

export const requireAuth: RequestHandler = (req, res, next) => {
  const token = readBearerToken(req);
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  try {
    const payload = verifyToken(token);
    req.userId = payload.sub;
    req.authEmail = payload.email;
    return next();
  } catch {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

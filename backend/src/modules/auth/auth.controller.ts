import type { RequestHandler } from 'express';
import type { Db } from '../../database/connection.js';
import { authService } from './auth.service.js';

export function makeAuthController(db: Db) {
  const register: RequestHandler = async (req, res, next) => {
    try {
      const { email, password, name } = req.body || {};
      if (!email || !password) return res.status(400).json({ error: 'Email dan password wajib diisi' });
      if (String(password).length < 6) return res.status(400).json({ error: 'Password minimal 6 karakter' });

      const result = await authService.register(db, {
        email: String(email),
        password: String(password),
        name: name ? String(name) : null,
      });
      res.json(result);
    } catch (err) {
      if (err instanceof Error) {
        return res.status(400).json({ error: err.message });
      }
      next(err);
    }
  };

  const login: RequestHandler = async (req, res, next) => {
    try {
      const { email, password } = req.body || {};
      if (!email || !password) return res.status(400).json({ error: 'Email dan password wajib diisi' });

      const result = await authService.login(db, { email: String(email), password: String(password) });
      res.json(result);
    } catch (err) {
      if (err instanceof Error) {
        return res.status(401).json({ error: err.message });
      }
      next(err);
    }
  };

  return { register, login };
}

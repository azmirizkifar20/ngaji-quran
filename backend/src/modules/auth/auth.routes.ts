import { Router } from 'express';
import type { Db } from '../../database/connection.js';
import { makeAuthController } from './auth.controller.js';

export function makeAuthRouter(db: Db) {
  const r = Router();
  const c = makeAuthController(db);

  r.post('/register', c.register);
  r.post('/login', c.login);

  return r;
}

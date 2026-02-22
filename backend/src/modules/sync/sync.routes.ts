import { Router } from 'express';
import type { Db } from '../../database/connection.js';
import { requireAuth } from '../../middlewares/auth.js';
import { makeSyncController } from './sync.controller.js';

export function makeSyncRouter(db: Db) {
  const r = Router();
  const c = makeSyncController(db);

  r.get('/', requireAuth, c.get);
  r.post('/', requireAuth, c.set);

  return r;
}

import { Router } from 'express';
import type { Db } from '../../database/connection.js';
import { makeUserController } from './user.controller.js';

export function makeUserRouter(db: Db) {
  const r = Router();
  const c = makeUserController(db);

  r.get('/state', c.getState);
  r.post('/profile', c.setProfile);
  r.post('/progress', c.setProgress);
  r.post('/goals', c.setGoals);
  r.post('/checkin', c.checkIn);
  r.post('/reset', c.resetState);

  return r;
}

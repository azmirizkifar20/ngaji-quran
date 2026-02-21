import { Router } from 'express';
import type { Db } from '../../database/connection.js';
import { makeLeaderboardController } from './leaderboard.controller.js';

export function makeLeaderboardRouter(db: Db) {
  const r = Router();
  const c = makeLeaderboardController(db);
  r.get('/', c.getLeaderboard);
  return r;
}

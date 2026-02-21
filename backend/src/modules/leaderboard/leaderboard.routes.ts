import { Router } from 'express';
import type { Db } from '../../database/connection';
import { makeLeaderboardController } from './leaderboard.controller';

export function makeLeaderboardRouter(db: Db) {
  const r = Router();
  const c = makeLeaderboardController(db);
  r.get('/', c.getLeaderboard);
  return r;
}

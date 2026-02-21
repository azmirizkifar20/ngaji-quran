import type { RequestHandler } from 'express';
import { z } from 'zod';
import type { Db } from '../../database/connection.js';
import { userService } from '../user/user.service.js';

export function makeLeaderboardController(db: Db) {
  const getLeaderboard: RequestHandler = async (req, res, next) => {
    try {
      const limit = z.coerce.number().int().min(1).max(100).optional().parse(req.query.limit ?? '20');
      const rows = await userService.leaderboard(db, limit);
      res.json({ leaderboard: rows });
    } catch (e) {
      next(e);
    }
  };

  return { getLeaderboard };
}

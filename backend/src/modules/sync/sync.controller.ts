import type { RequestHandler } from 'express';
import type { Db } from '../../database/connection.js';
import { syncService } from './sync.service.js';

export function makeSyncController(db: Db) {
  const get: RequestHandler = async (req, res, next) => {
    try {
      const userId = req.userId as string;
      const result = await syncService.get(db, userId);
      res.json(result);
    } catch (err) {
      next(err);
    }
  };

  const set: RequestHandler = async (req, res, next) => {
    try {
      const userId = req.userId as string;
      const { data } = req.body || {};
      if (!data || typeof data !== 'object') {
        return res.status(400).json({ error: 'Payload data tidak valid' });
      }
      const result = await syncService.set(db, userId, data);
      res.json(result);
    } catch (err) {
      next(err);
    }
  };

  return { get, set };
}

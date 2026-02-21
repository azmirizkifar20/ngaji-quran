import type { RequestHandler } from 'express';
import { z } from 'zod';
import type { Db } from '../../database/connection';
import { userService } from './user.service';

export function makeUserController(db: Db) {
  const getState: RequestHandler = async (req, res, next) => {
    try {
      const userId = req.userId || 'local';
      const state = await userService.getState(db, userId);
      res.json({ state });
    } catch (e) {
      next(e);
    }
  };

  const setProfile: RequestHandler = async (req, res, next) => {
    const schema = z.object({
      name: z.string().min(1).max(40).nullable(),
    });
    const body = schema.safeParse(req.body);
    if (!body.success) return res.status(400).json({ error: body.error.flatten() });

    try {
      const userId = req.userId || 'local';
      const state = await userService.setProfile(db, userId, body.data);
      res.json({ state });
    } catch (e) {
      next(e);
    }
  };

  const setProgress: RequestHandler = async (req, res, next) => {
    const schema = z.object({
      lastVerseKey: z.string().regex(/^\d+:\d+$/),
      lastPageNumber: z.number().int().min(1).max(604),
    });

    const body = schema.safeParse(req.body);
    if (!body.success) return res.status(400).json({ error: body.error.flatten() });

    try {
      const userId = req.userId || 'local';
      const state = await userService.setProgress(db, userId, body.data);
      res.json({ state });
    } catch (e) {
      next(e);
    }
  };

  const setGoals: RequestHandler = async (req, res, next) => {
    const schema = z.object({
      targetDays: z.number().int().min(1).max(3650),
      startDate: z.string().datetime().optional(),
    });

    const body = schema.safeParse(req.body);
    if (!body.success) return res.status(400).json({ error: body.error.flatten() });

    try {
      const userId = req.userId || 'local';
      const state = await userService.setGoals(db, userId, body.data);
      res.json({ state });
    } catch (e) {
      next(e);
    }
  };

  const checkIn: RequestHandler = async (req, res, next) => {
    try {
      const userId = req.userId || 'local';
      const state = await userService.checkIn(db, userId);
      res.json({ state });
    } catch (e) {
      next(e);
    }
  };

  return { getState, setProfile, setProgress, setGoals, checkIn };
}

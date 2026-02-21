import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import type { Db } from './database/connection';
import { getEnv } from './config/env';
import { quranRouter } from './modules/quran/quran.routes';
import { userIdentity } from './middlewares/user';
import { makeLeaderboardRouter } from './modules/leaderboard/leaderboard.routes';
import { makeUserRouter } from './modules/user/user.routes';
import { errorHandler } from './middlewares/error';

export function createApp(db: Db) {
  const env = getEnv();
  const app = express();

  app.use(helmet());
  app.use(compression());
  app.use(express.json({ limit: '1mb' }));
  app.use(morgan('tiny'));

  app.use(
    cors({
      origin: (origin, cb) => {
        if (!origin) return cb(null, true);
        if (env.CORS_ORIGIN === '*') return cb(null, true);
        const allowed = env.CORS_ORIGIN.split(',').map((s) => s.trim());
        if (allowed.includes(origin)) return cb(null, true);
        return cb(new Error('Not allowed by CORS'));
      },
    })
  );

  app.get('/api/health', (_req, res) => res.json({ ok: true }));

  // attach lightweight user identity (x-user-id)
  app.use(userIdentity);

  app.use('/api/quran', quranRouter);
  app.use('/api/user', makeUserRouter(db));
  app.use('/api/leaderboard', makeLeaderboardRouter(db));

  app.use(errorHandler);

  return app;
}

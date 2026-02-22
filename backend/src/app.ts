import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import type { Db } from './database/connection.js';
import { getEnv } from './config/env.js';
import { quranRouter } from './modules/quran/quran.routes.js';
import { userIdentity } from './middlewares/user.js';
import { makeUserRouter } from './modules/user/user.routes.js';
import { makeAuthRouter } from './modules/auth/auth.routes.js';
import { makeSyncRouter } from './modules/sync/sync.routes.js';
import { errorHandler } from './middlewares/error.js';

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

  app.use('/api/auth', makeAuthRouter(db));
  app.use('/api/quran', quranRouter);
  app.use('/api/user', makeUserRouter(db));
  app.use('/api/sync', makeSyncRouter(db));

  app.use(errorHandler);

  return app;
}

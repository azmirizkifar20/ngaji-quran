import { z } from 'zod';

const EnvSchema = z.object({
  PORT: z.coerce.number().int().min(1).max(65535).default(8080),
  CORS_ORIGIN: z.string().default('*'),
  QURAN_COM_BASE_URL: z.string().url().default('https://api.quran.com/api/v4'),

  DB_CLIENT: z.enum(['sqlite3', 'mysql2']).default('sqlite3'),
  SQLITE_FILE: z.string().default('./dev.db'),

  DB_HOST: z.string().default('127.0.0.1'),
  DB_PORT: z.coerce.number().int().min(1).max(65535).default(3306),
  DB_USER: z.string().default('root'),
  DB_PASSWORD: z.string().default(''),
  DB_NAME: z.string().default('ngaji_quran'),

  CACHE_TTL_SECONDS: z.coerce.number().int().min(10).max(86400).default(3600),
  JWT_SECRET: z.string().min(16).default('dev-secret-change-me'),
});

export type Env = z.infer<typeof EnvSchema>;

export function getEnv(): Env {
  const parsed = EnvSchema.safeParse({
    PORT: process.env.PORT,
    CORS_ORIGIN: process.env.CORS_ORIGIN,
    QURAN_COM_BASE_URL: process.env.QURAN_COM_BASE_URL,

    DB_CLIENT: process.env.DB_CLIENT,
    SQLITE_FILE: process.env.SQLITE_FILE,
    DB_HOST: process.env.DB_HOST,
    DB_PORT: process.env.DB_PORT,
    DB_USER: process.env.DB_USER,
    DB_PASSWORD: process.env.DB_PASSWORD,
    DB_NAME: process.env.DB_NAME,

    CACHE_TTL_SECONDS: process.env.CACHE_TTL_SECONDS,
    JWT_SECRET: process.env.JWT_SECRET,
  });

  if (!parsed.success) {
    // keep the error readable in logs
    // eslint-disable-next-line no-console
    console.error('❌ Invalid environment variables:', parsed.error.flatten());
    throw new Error('Invalid environment variables');
  }

  return parsed.data;
}

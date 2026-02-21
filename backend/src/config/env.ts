import { z } from 'zod';

const EnvSchema = z.object({
  PORT: z.coerce.number().int().min(1).max(65535).default(8080),
  CORS_ORIGIN: z.string().default('*'),
  QURAN_COM_BASE_URL: z.string().url().default('https://api.quran.com/api/v4'),
  SQLITE_FILE: z.string().default('./dev.db'),
  CACHE_TTL_SECONDS: z.coerce.number().int().min(10).max(86400).default(3600),
});

export type Env = z.infer<typeof EnvSchema>;

export function getEnv(): Env {
  const parsed = EnvSchema.safeParse({
    PORT: process.env.PORT,
    CORS_ORIGIN: process.env.CORS_ORIGIN,
    QURAN_COM_BASE_URL: process.env.QURAN_COM_BASE_URL,
    SQLITE_FILE: process.env.SQLITE_FILE,
    CACHE_TTL_SECONDS: process.env.CACHE_TTL_SECONDS,
  });

  if (!parsed.success) {
    // keep the error readable in logs
    // eslint-disable-next-line no-console
    console.error('âŒ Invalid environment variables:', parsed.error.flatten());
    throw new Error('Invalid environment variables');
  }

  return parsed.data;
}

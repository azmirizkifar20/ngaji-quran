import type { ErrorRequestHandler } from 'express';

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  const message = err?.message || 'Internal Server Error';

  // eslint-disable-next-line no-console
  console.error('❌ Error:', err);

  res.status(500).json({
    error: message,
  });
};

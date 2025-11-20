import { Request, Response, NextFunction } from 'express';
import { config } from '../config/env';

export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  _next: NextFunction
) {
  console.error('[Error]', err);

  const status = err.status || 500;
  const message =
    status === 500 && config.nodeEnv === 'production'
      ? 'Internal server error'
      : err.message || 'Something went wrong';

  res.status(status).json({ message });
}

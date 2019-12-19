import { Request, Response, NextFunction } from 'express';
import { TaskRouterEvent } from '../twilio';
import { logger } from '../logger';

/**
 * BotFilterMiddleware is an middleware that filters events emitted by "bot" workers,
 * such as the dialer ones
 */
export const botFilterMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const { body: event } = req as { body: TaskRouterEvent };

  if (event.WorkerAttributes) {
    const { bot = false } = JSON.parse(event.WorkerAttributes);

    if (bot) {
      logger.info('Ignoring bot related event: ', event);
      res.status(200).json();
      return;
    }
  }

  next();
};

import { Request, Response, NextFunction } from 'express';
import { TaskRouterEvent } from '../twilio';
import { logger } from '../logger';

/**
 * heartbeatFilterMiddleware is an middleware responsible for filtring heartbeat
 * verification on TaskRouter
 */
export const heartbeatFilterMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  const { body: event } = req as { body: TaskRouterEvent };

  if (event.TaskAttributes) {
    const { heartbeat = false } = JSON.parse(event.TaskAttributes);

    if (heartbeat) {
      logger.info('Ignoring heartbeat related event: ', event.EventType);
      logger.debug('Ignored event details: ', event);
      res.status(200).json();
      return;
    }
  }

  next();
};

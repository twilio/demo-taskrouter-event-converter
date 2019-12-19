import { Request, Response, NextFunction } from 'express';
import { TaskRouterEvent, isTaskEvent } from '../twilio';
import { logger } from '../logger';

/**
 * taskFilterMiddleware is an middleware responsible for filtring task events from tasks that aren't
 * related to a call, such the creation of a dialer task that deals with the scheduling of a call to
 * be made in the future, and the task isn't a call itself.
 */
export const taskFilterMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const { body: event } = req as { body: TaskRouterEvent };

  if (isTaskEvent(event) && event.TaskAttributes) {
    const { call_id = null } = JSON.parse(event.TaskAttributes);

    if (!call_id) {
      logger.info('Ignoring non-call related task event: ', event.EventType);
      logger.debug('Ignored event details: ', event);
      res.status(200).json();
      return;
    }
  }

  next();
};

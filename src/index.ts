import express from 'express';
import fetch, { Headers } from 'node-fetch';
import { IncomingHttpHeaders } from 'http';
import { logger } from './logger';
import { taskRouterEventConverter } from './events/task-router';

interface CommonRequestDetails {
  body: any;
  headers: IncomingHttpHeaders;
  method: string;
  params: Record<string, any>;
  url: string;
  query: Record<string, any>;
  ip?: string | string[];
  status?: number;

}

const getCommonRequestDetails = (req: express.Request): CommonRequestDetails => {
  const {
    method, statusCode, headers, url, connection, body, params, query,
  } = req;

  return {
    body,
    headers,
    method,
    params,
    url,
    query,
    ip: headers['x-forwarded-for'] || connection.remoteAddress,
    status: statusCode,
  };
};

const requestLogger = (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction,
): void => {
  logger.info(`Received request to ${req.method} ${req.url}`);
  next();
};

((): void => {
  const app = express();

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(requestLogger);

  app.post('/webhook', (req, res) => {
    const { body: event } = req;

    logger.info(`POST /webhook: Received ${event.EventType}.`);
    logger.debug('Event details: ', event);
    const events = taskRouterEventConverter(event);

    if (events && events.length) {
      events.forEach(async (ev: any) => {
        logger.info(`Emitting event converted from ${event.EventType}`, ev);

        const response = await fetch('https://developers-staging.teravoz.com.br/myevents?login=enristaging', {
          method: 'POST',
          body: JSON.stringify(ev),
          headers: new Headers({
            'Content-Type': 'application/json',
          }),
        });

        logger.info('Event emitted: ', response);
      });
    } else {
      logger.info(`Event ${event.EventType} not found to convert to Teravoz's event. Ignoring.`);
    }

    res.status(204).json();
  });

  app.listen('3000', () => {
    logger.info('Server running at http://localhost:3000');
  });
})();

import express from 'express';
import fetch, { Headers } from 'node-fetch';
import { IncomingHttpHeaders } from 'http';
import { logger } from './logger';
import { taskRouterEventConverter } from './events/task-router';
import { gatherInputConverter } from './events/gather-input';
import { ApiClient } from './externals/api-client';
import { TeravozEvent } from './events/teravoz';

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
  logger.debug('Request Details:', getCommonRequestDetails(req));
  next();
};

((): void => {
  const app = express();
  const client = new ApiClient();

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(requestLogger);

  app.post('/webhook', async (req, res) => {
    const { body: event } = req;

    logger.info(`POST /webhook: Received ${event.EventType}.`);
    const events = taskRouterEventConverter(event);

    if (events && events.length) {
      const responses = await client.sendMultipleEventsToWebhook(events);
      logger.info(`${responses.length} event(s) sended.`);
      logger.debug('Events responses: ', responses);
    } else {
      logger.info(`Event ${event.EventType} not found to convert to Teravoz's event. Ignoring.`);
    }

    res.status(204).json();
  });

  app.post('/input', async (req, res) => {
    const { body: input } = req;

    if (!input.CallSid) {
      logger.warn('POST /input: Received input without a CallSid. Ignoring.');
      return;
    }

    logger.info(`POST /input: Received input from ${input.CallSid}`);
    const events = gatherInputConverter(input);

    if (events && events.length) {
      const responses = await client.sendMultipleEventsToWebhook(events);
      logger.info(`${responses.length} event(s) sended.`);
      logger.debug('Events responses: ', responses);
    } else {
      logger.info(`Input ${input.InputType} not found to convert to Teravoz's event. Ignoring.`);
    }

    res.status(200).json();
  });

  app.listen('3000', () => {
    logger.info('Server running at http://localhost:3000');
  });
})();

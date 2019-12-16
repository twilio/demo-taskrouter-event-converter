import express, { Request, Response } from 'express';

import { logger } from '../logger';
import { taskRouterEventConverter } from '../events/task-router';
import { ApiClient } from '../externals/api-client';
import { gatherInputConverter } from '../events/gather-input';

const webhookHandler = async (req: Request, res: Response): Promise<void> => {
  const { body: event } = req;

  logger.info(`POST /webhook: Received ${event.EventType}.`);
  const events = taskRouterEventConverter(event);

  if (events && events.length) {
    const client = new ApiClient();
    const responses = await client.sendMultipleEventsToWebhook(events);
    logger.info(`${responses.length} event(s) sended.`);
    logger.debug('Events responses: ', responses);
  } else {
    logger.info(`Event ${event.EventType} not found to convert to Teravoz's event. Ignoring.`);
  }

  res.status(204).json();
};

const inputHandler = async (req: Request, res: Response): Promise<void> => {
  const { body: input } = req;

  if (!input.CallSid) {
    logger.warn('POST /input: Received input without a CallSid. Ignoring.');
    return;
  }

  logger.info(`POST /input: Received input from ${input.CallSid}`);
  const events = gatherInputConverter(input);

  if (events && events.length) {
    const client = new ApiClient();
    const responses = await client.sendMultipleEventsToWebhook(events);
    logger.info(`${responses.length} event(s) sended.`);
    logger.debug('Events responses: ', responses);
  } else {
    logger.info(`Input ${input.InputType} not found to convert to Teravoz's event. Ignoring.`);
  }

  res.status(200).json();
};

const dialerEventHandler = async (req: Request, res: Response): Promise<void> => {
  const { body: event } = req;
  logger.info('Received dialer event: ', event);

  res.send(200).json();
};

export const loadRoutesInto = (app: express.Application): void => {
  app.post('/webhook', webhookHandler);
  app.post('/input', inputHandler);
  app.post('/dialer', dialerEventHandler);
};

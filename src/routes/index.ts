import express, { Request, Response } from 'express';

import { logger } from '../logger';
import { taskRouterEventConverter } from '../events/task-router';
import { ApiClient } from '../externals/api-client';
import { gatherInputConverter } from '../events/gather-input';
import { TwilioCustomDialerEvent, dialerEventsConverter } from '../events/dialer';

/**
 * webhookHandler handles all the incomming TaskRouter's events.
 *
 * The TaskRouter events callback should be configurated to the endpoint
 * that use this function as his handler. The handler will listen to all
 * the TaskRouter's events, transforming the mapped events and ignoring
 * the unmapped ones.
 *
 * @param req Express incomming request object
 * @param res Express response object
 */
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

/**
 * inputHandler handles the input of the user in a call, provided by Twilio's
 * TwiML <Gather> component or Twilio Studio.
 *
 * The API call to this handler is made manually, so differently from the webhook hander,
 * who listen to all the TaskRouter's events emitted, this handler has to be called
 * manually to trigger his respectives Teravoz's event.
 *
 * @param req Express incomming request object
 * @param res Express response object
 */
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

/**
 * dialerEventHandler handles all the events provided by Twilio's dialer. Since the
 * Twilio's dialer is a custom implementation made by Teravoz, these events are also triggered
 * manually in the execution of the Twilio's dialer functions.
 *
 * @param req Express incomming request object
 * @param res Express response object
 */
const dialerEventHandler = async (req: Request, res: Response): Promise<void> => {
  const { body: event } = req as { body: TwilioCustomDialerEvent };

  logger.info(`POST /dialer: Received ${event.EventType}`);
  const events = dialerEventsConverter(event);

  if (events && events.length) {
    const client = new ApiClient();
    const responses = await client.sendMultipleEventsToWebhook(events);
    logger.info(`${responses.length} event(s) sended.`);
    logger.debug('Events responses: ', responses);
  } else {
    logger.info(`Twilio's dialer event ${event.EventType} not found to convert to Teravoz's event. Ignoring.`);
  }

  res.send(200).json();
};

/**
 * loadRoutesInto Load the routes into the provided express application instance
 * @param app The express application to attatch the routes
 */
export const loadRoutesInto = (app: express.Application): void => {
  app.post('/webhook', webhookHandler);
  app.post('/input', inputHandler);
  app.post('/dialer', dialerEventHandler);
};

import fetch, { Headers } from 'node-fetch';
import { environment } from '../environment';
import { logger } from '../logger';
import { TeravozEvent } from '../teravoz';

/**
 * WebhookResponse represents the object structure that will be returned
 * after sending an event to an given webhook.
 *
 */
export interface WebhookResponse {
  /** body represents the response returned by the API */
  body: any;
  /** status is the statusCode returned by the API   */
  status: number;
}

/**
 * ApiClient is a class that contains all the operations related to
 * the external webhook API where the events will be sended.
 */
export class ApiClient {
  /**
   * baseURL is the base of the URL where the events will be sended
   */
  private baseURL: string;

  constructor() {
    this.baseURL = environment.externalWebhookEndpoint || '';
  }

  /**
   * sendEventToWebhook sends a single event to the target webhook
   *
   * @param event A generic Teravoz's Event. See more in [[TeravozEvent]]
   */
  public async sendEventToWebhook(event: TeravozEvent): Promise<WebhookResponse> {
    try {
      logger.info(`Sending ${event.type} to webhook.`);

      let toSend = event;

      if (environment.suppressSid) {
        toSend = {
          ...event,
          sid: undefined,
        };
      }

      const res = await fetch(this.baseURL, {
        method: 'POST',
        body: JSON.stringify(toSend),
        headers: new Headers({
          'Content-Type': 'application/json',
        }),
      });

      if (res.ok) {
        logger.info(`${event.type} emitted successfully.`);
      } else {
        const text = await res.text();
        logger.warn(`An unexpected error occurred while posting ${event.type}: `, text);

        return {
          body: text,
          status: res.status,
        };
      }

      const json = await res.json();

      return {
        body: json,
        status: res.status,
      };
    } catch (err) {
      logger.error(`Error while sending event to ${this.baseURL}: `, err);
      throw err;
    }
  }

  /**
   * SendMultipleEventsToWebhook sends all the events provided, one by one, to the
   * target endpoint. The requests are made in parallel and, if an error is thrown in
   * any request, the error flow will be trigered.
   *
   * @param events An array of generic Teravoz's Events. See more in [[TeravozEvent]]
   */
  public async sendMultipleEventsToWebhook(events: TeravozEvent[]): Promise<WebhookResponse[]> {
    try {
      const promises = events.map(event => this.sendEventToWebhook(event));

      return await Promise.all(promises);
    } catch (err) {
      logger.error('Error while sending multiple events: ', err);
      throw err;
    }
  }
}

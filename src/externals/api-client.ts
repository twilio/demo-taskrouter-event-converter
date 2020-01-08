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
  body: any;
  status: number;
  ok: boolean;
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
      logger.info(`Sending ${event.type} to ${this.baseURL}`);

      const toSend = {
        ...event,
        sid: environment.suppressSid ? undefined : event.sid,
      };

      const res = await fetch(this.baseURL, {
        method: 'POST',
        body: JSON.stringify(toSend),
        headers: new Headers({
          'Content-Type': 'application/json',
        }),
      });

      if (res.ok) {
        logger.info(`${event.type} sended successfully.`);
      } else {
        const text = await res.text();
        logger.warn(`An unexpected error occurred while posting ${event.type}: `, text);

        return {
          body: text,
          status: res.status,
          ok: false,
        };
      }

      const json = await res.json();

      return {
        body: json,
        status: res.status,
        ok: true,
      };
    } catch (err) {
      logger.error(`Error while sending event to ${this.baseURL}: `, err);
      throw err;
    }
  }
}

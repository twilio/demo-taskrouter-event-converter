import fetch, { Headers } from 'node-fetch';
import { environment } from '../environment';
import { logger } from '../logger';
import { TeravozEvent } from '../events/teravoz';

export interface WebhookResponse {
  body: any;
  status: number;
}

export class ApiClient {
  private baseURL: string;

  constructor() {
    this.baseURL = environment.externalWebhookEndpoint || '';
  }

  public async sendEventToWebhook(event: TeravozEvent): Promise<WebhookResponse> {
    try {
      logger.info(`Sending ${event.type} to webhook.`);

      const res = await fetch(this.baseURL, {
        method: 'POST',
        body: JSON.stringify(event),
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

  public async sendMultipleEventsToWebhook(events: TeravozEvent[]): Promise<WebhookResponse[]> {
    try {
      const promises = events.map((event) => this.sendEventToWebhook(event));

      return await Promise.all(promises);
    } catch (err) {
      logger.error('Error while sending multiple events: ', err);
      throw err;
    }
  }
}

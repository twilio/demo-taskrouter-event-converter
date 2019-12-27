import amqplib from 'amqplib';

import { RabbitMQ } from '.';
import { logger } from '../logger';

export class RabbitMQPublisher {
  private queue: string;

  private rabbitmq: RabbitMQ;

  private channel: amqplib.Channel | null;

  constructor(queue: string) {
    this.queue = queue;
    this.rabbitmq = new RabbitMQ();
    this.channel = null;
  }

  async openConnection(): Promise<void> {
    try {
      await this.rabbitmq.connect();
    } catch (err) {
      logger.error(err);
    }
  }

  async openChannel(): Promise<void> {
    try {
      this.channel = await this.rabbitmq.createChannel();
    } catch (err) {
      logger.error(err);
    }
  }

  async publish(content: any): Promise<void> {
    try {
      if (!this.rabbitmq.conn) {
        throw new Error('Connection not opened.');
      }

      if (!this.channel) {
        throw new Error('Channel not opened.');
      }

      await this.channel.assertQueue(this.queue);
      this.channel.sendToQueue(this.queue, Buffer.from(JSON.stringify(content)));
    } catch (err) {
      logger.error('Error while publishing to RabbitMQ queue:', err);
    }
  }

  async dispose(): Promise<void> {
    try {
      if (this.channel) {
        await this.channel.close();
      }

      await this.rabbitmq.dispose();
    } catch (err) {
      logger.error('Error while closing RabbitMQ publisher:', err);
      throw err;
    }
  }
}

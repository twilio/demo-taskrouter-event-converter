import amqplib from 'amqplib';
import { environment } from '../environment';
import { logger } from '../logger';
import { RabbitMQPublisher } from './publisher';

export class RabbitMQ {
  private uri: string;

  public conn: amqplib.Connection | null;

  constructor() {
    const { host, port, user, password } = environment.rabbitmq;

    this.uri = `amqp://${user}:${password}@${host}:${port}`;
    this.conn = null;
  }

  async connect(): Promise<void> {
    try {
      this.conn = await amqplib.connect(this.uri);
      logger.info('Created a new connection to RabbitMQ: ', this.uri);
    } catch (err) {
      logger.error('Error while opening an amqp connection:', err);
      throw err;
    }
  }

  async createChannel(): Promise<amqplib.Channel> {
    try {
      if (!this.conn) {
        throw new Error('Connection not estabilished.');
      }

      return await this.conn.createChannel();
    } catch (err) {
      logger.error('Error while creating an amqp channel:', err);
      throw err;
    }
  }

  async dispose(): Promise<void> {
    try {
      if (this.conn) {
        await this.conn.close();
      }
    } catch (err) {
      logger.error('Error while disposing RabbitMQ client:', err);
      throw err;
    }
  }
}

export const publisher = new RabbitMQPublisher(environment.rabbitmq.queue || 'events');

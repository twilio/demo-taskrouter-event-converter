import express from 'express';
import { IncomingHttpHeaders } from 'http';
import { logger } from './logger';
import { loadRoutesInto } from './routes';

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

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(requestLogger);
  loadRoutesInto(app);

  app.listen('3000', () => {
    logger.info('Server running at http://localhost:3000');
  });
})();

const express = require('express');
const { logger } = require('./logger');

const { taskRouterEventHandler } = require('./events/task-router');

const getCommonRequestDetails = (req) => {
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

const requestLogger = (req, res, next) => {
  logger.info(`Received request to ${req.method} ${req.url}`);
  logger.debug(getCommonRequestDetails(req));
  next();
};

(() => {
  const app = express();

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(requestLogger);

  app.post('/webhook', (req, res) => {
    const { body: event } = req;

    logger.info(`POST /webhook: Received ${event.EventType}.`, event);
    const events = taskRouterEventHandler(event);

    if (events && events.length) {
      events.forEach((ev) => {
        logger.info(`Emitting event converted from ${event.EventType}`, ev);
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

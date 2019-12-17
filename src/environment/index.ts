/**
 * environment is an POJO that centralize all the environment variables
 * that is used in the whole project.
 */
export const environment = {
  httpPort: process.env.HTTP_PORT,
  externalWebhookEndpoint: process.env.EXTERNAL_WEBHOOK_ENDPOINT,
  logLevel: process.env.LOG_LEVEL || 'info',
};

import pino from 'pino';
import { environment } from '../environment';

const logger = pino({ level: environment.logLevel });

export { logger };

import { TeravozEvent } from '../../teravoz';
import { TwilioCustomDialerEvent, TwilioCustomDialerEventsTypes } from '.';
import { twilioDialerAttemptHandler } from './attempt';
import { twilioDialerSuccessHandler } from './success';
import { twilioDialerFailureHandler } from './failure';
import { twilioDialerExpiredHandler } from './expired';
import { twilioDialerExceededHandler } from './exceeded';

type Handler = (event: TwilioCustomDialerEvent) => TeravozEvent[];

type EventsMapping = {
  [K in TwilioCustomDialerEventsTypes]?: Handler;
};

/**
 * eventsMapping maps each custom dialer event types to a handler
 * that is responsible for convert it to zero or more Teravoz's
 * events.
 */
export const eventsMapping: EventsMapping = {
  'custom.dialer.attempt': twilioDialerAttemptHandler,
  'custom.dialer.success': twilioDialerSuccessHandler,
  'custom.dialer.failure': twilioDialerFailureHandler,
  'custom.dialer.expired': twilioDialerExpiredHandler,
  'custom.dialer.exceeded': twilioDialerExceededHandler,
};

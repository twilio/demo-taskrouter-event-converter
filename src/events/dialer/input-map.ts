import { TeravozEvent } from '../teravoz';
import { TwilioCustomDialerEvent, TwilioCustomDialerEventsTypes } from '.';
import { twilioDialerAttemptHandler } from './attempt';
import { twilioDialerSuccessHandler } from './success';
import { twilioDialerFailureHandler } from './failure';

type Handler = (event: TwilioCustomDialerEvent) => TeravozEvent[];

type EventsMapping = {
  [K in TwilioCustomDialerEventsTypes]?: Handler
}

export const eventsMapping: EventsMapping = {
  'custom.dialer.attempt': twilioDialerAttemptHandler,
  'custom.dialer.success': twilioDialerSuccessHandler,
  'custom.dialer.failure': twilioDialerFailureHandler,
};

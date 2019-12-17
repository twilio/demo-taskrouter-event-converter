import { TeravozEvent } from '../teravoz';
import { TwilioCustomDialerEvent, TwilioCustomDialerEventsTypes } from '.';
import { twilioDialerAttemptHandler } from './attempt';

type Handler = (event: TwilioCustomDialerEvent) => TeravozEvent[];

type EventsMapping = {
  [K in TwilioCustomDialerEventsTypes]?: Handler
}

export const eventsMapping: EventsMapping = {
  'custom.dialer.attempt': twilioDialerAttemptHandler,
};

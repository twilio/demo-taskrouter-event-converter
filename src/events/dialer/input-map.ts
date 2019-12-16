import { TeravozEvent } from '../teravoz';
import { TwilioCustomDialerEvent, TwilioCustomDialerEventsTypes } from '.';

type Handler = (event: TwilioCustomDialerEvent) => TeravozEvent[];

type EventsMapping = {
  [K in TwilioCustomDialerEventsTypes]?: Handler
}

export const eventsMapping: EventsMapping = {

};

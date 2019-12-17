import { TeravozEvent } from '../teravoz';
import { converter } from '../converter';
import { eventsMapping } from './input-map';

export enum TwilioCustomDialerEventsTypes {
  dialerAttempt = 'custom.dialer.attempt'
}

export interface TwilioCustomDialerEvent {
  EventType: TwilioCustomDialerEventsTypes;
  To: string;
  TimestampMs: string;
  CallSid?: string;
}

export const dialerEventsConverter = (event: TwilioCustomDialerEvent): TeravozEvent[] => converter(eventsMapping, event.EventType, event);

import { TeravozEvent, TeravozAmdStatus } from '../teravoz';
import { converter } from '../converter';
import { eventsMapping } from './input-map';

export enum TwilioCustomDialerEventsTypes {
  dialerAttempt = 'custom.dialer.attempt',
  dialerSuccess = 'custom.dialer.success',
  dialerFailure = 'custom.dialer.failure'
}

export type TwilioAmdStatus =
  'machine_start'
  | 'machine_end_beep'
  | 'machine_end_silence'
  | 'machine_end_other'
  | 'human'
  | 'fax'
  | 'unknown';

export interface TwilioCustomDialerEvent {
  EventType: TwilioCustomDialerEventsTypes;
  To: string;
  TimestampMs: string;
  CallSid?: string;
  AmdStatus?: TwilioAmdStatus;
}

export const twilioAmdStatusToTeravoz = (amdStatus?: TwilioAmdStatus): TeravozAmdStatus | null => {
  if (!amdStatus) {
    return null;
  }

  const mapping: Record<TwilioAmdStatus, TeravozAmdStatus> = {
    human: 'human',
    fax: 'machine',
    machine_start: 'machine',
    machine_end_beep: 'machine',
    machine_end_other: 'machine',
    machine_end_silence: 'machine',
    unknown: 'notsure',
  };

  return mapping[amdStatus];
};

export const dialerEventsConverter = (event: TwilioCustomDialerEvent): TeravozEvent[] => converter(eventsMapping, event.EventType, event);

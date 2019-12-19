import { TeravozEvent, TeravozAmdStatus } from '../teravoz';
import { converter } from '../converter';
import { eventsMapping } from './input-map';

/**
 * TwilioCustomDialerEventTypes contains the EventTypes related to
 * the dialer. These event names are defined by the Teravoz's custom dialer implementation,
 * and unlike the TaskRouter EventTypes they're not defined by Twilio itself.
 */
export enum TwilioCustomDialerEventsTypes {
  dialerAttempt = 'custom.dialer.attempt',
  dialerSuccess = 'custom.dialer.success',
  dialerFailure = 'custom.dialer.failure'
}

/**
 * TwilioAmdStatus contains the possibles "AnsweredBy" values of a call
 * that uses the Twilio Answering Machine Detection.
 */
export type TwilioAmdStatus =
  'machine_start'
  | 'machine_end_beep'
  | 'machine_end_silence'
  | 'machine_end_other'
  | 'human'
  | 'fax'
  | 'unknown';

/**
 * TwilioCustomDialerEvent represents the structure of a dialer event emitted
 * by Teravoz's custom dialer implementation. These events aren't defaults from Twilio
 * and are triggered manually in the dialer implementation. It's structure is defined
 * to be closely to the TaskRouter events, but it's important to know that these events
 * are customizables.
 */
export interface TwilioCustomDialerEvent {
  EventType: TwilioCustomDialerEventsTypes;
  To: string;
  TimestampMs: string;
  TaskAttributes: string;
  CallSid?: string;
  AmdStatus?: TwilioAmdStatus;
}

/**
 * twilioAmdStatusToTeravoz converts the 'AnsweredBy' property from Twilio to an
 * equivalent value in the Teravoz's events.
 *
 * If an invalid or null amdStatus is passed, this function will return null.
 *
 * @param amdStatus the Twilio 'AnsweredBy' property that was provided in the call
 */
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

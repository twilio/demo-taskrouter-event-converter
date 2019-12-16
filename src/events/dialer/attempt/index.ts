import { TwilioCustomDialerEvent, TwilioCustomDialerEventsTypes } from '..';
import { DialerEvent, DialerEvents } from '../../teravoz';
import { getTime } from '../../../date';

export const twilioDialerAttemptHandler = ({
  EventType, To, TimestampMs,
}: TwilioCustomDialerEvent): [DialerEvent] => {
  if (EventType !== TwilioCustomDialerEventsTypes.dialerAttempt) {
    throw new Error(`Only inputs of type '${TwilioCustomDialerEventsTypes.dialerAttempt}' can be handled by userInputNpsHandler.`);
  }

  return [{
    type: DialerEvents.dialerAttempt,
    number: To,
    timestamp: getTime(TimestampMs),
  }];
};

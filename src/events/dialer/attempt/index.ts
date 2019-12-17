import { TwilioCustomDialerEvent, TwilioCustomDialerEventsTypes } from '..';
import { DialerEvent, DialerEvents } from '../../teravoz';
import { getTime } from '../../../date';

export const twilioDialerAttemptHandler = ({
  EventType, To, TimestampMs, TaskAttributes,
}: TwilioCustomDialerEvent): [DialerEvent] => {
  if (EventType !== TwilioCustomDialerEventsTypes.dialerAttempt) {
    throw new Error(`Only inputs of type '${TwilioCustomDialerEventsTypes.dialerAttempt}' can be handled by twilioDialerAttemptHandler.`);
  }

  const taskAttributes = TaskAttributes && JSON.parse(TaskAttributes);

  return [{
    type: DialerEvents.dialerAttempt,
    number: To,
    code: taskAttributes && taskAttributes.code,
    timestamp: getTime(TimestampMs),
  }];
};

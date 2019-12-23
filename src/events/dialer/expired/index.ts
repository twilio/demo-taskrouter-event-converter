import { TwilioCustomDialerEvent, TwilioCustomDialerEventsTypes } from '..';
import { DialerEvent, DialerEvents } from '../../../teravoz';
import { getTime } from '../../../date';

/**
 * twilioDialerAttemptHandler converts `custom.dialer.expired` to the
 * equivalent Teravoz's event `dialer.expired`
 *
 * The `custom.dialer.expired` after the task ttl is reached.
 * This event is a custom event, so it's not a default from Twilio;
 * It's only triggered manually calling the endpoint responsible from listening dialer
 * custom events. Therefore, there's not a EventSid in Twilio to identify the
 * action that triggered this event.
 *
 * The structure of the conversion is:
 *
|  Teravoz  | Twilio Dialer Event |              Value              |
|:---------:|:-------------------:|:-------------------------------:|
|   type    |      EventType      | Converted into "dialer.expired" |
|   code    | TaskAttributes.code |       TaskAttributes.code       |
| timestamp |     TimestampMs     |     Timestamp UTC's string      |

 * @param twilioCustomDialerEvent
 */
export const twilioDialerExpiredHandler = ({
  EventType, TimestampMs, TaskAttributes,
}: TwilioCustomDialerEvent): [DialerEvent] => {
  if (EventType !== TwilioCustomDialerEventsTypes.dialerExpired) {
    throw new Error(`Only inputs of type '${TwilioCustomDialerEventsTypes.dialerExpired}' can be handled by twilioDialerExpiredHandler.`);
  }

  const taskAttributes = TaskAttributes && JSON.parse(TaskAttributes);

  return [{
    type: DialerEvents.dialerExpired,
    code: taskAttributes && taskAttributes.code,
    timestamp: getTime(TimestampMs),
  }];
};

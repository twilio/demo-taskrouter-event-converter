import { TwilioCustomDialerEvent, TwilioCustomDialerEventsTypes } from '..';
import { DialerEvent, DialerEvents } from '../../../teravoz';
import { getTime } from '../../../date';

/**
 * twilioDialerExceededHandler converts `custom.dialer.exceeded` to the
 * equivalent Teravoz's event `dialer.exceeded`
 *
 * The `custom.dialer.exceeded` is triggered after the number of retries is greater
 * than the maximum retries count setted on the creation of the dialer task.
 * This event is a custom event, so it's not a default from Twilio;
 * It's only triggered manually calling the endpoint responsible from listening dialer
 * custom events. Therefore, there's not a EventSid in Twilio to identify the
 * action that triggered this event.
 *
 * The structure of the conversion is:
 *
|  Teravoz  | Twilio Dialer Event |              Value               |
|:---------:|:-------------------:|:--------------------------------:|
|   type    |      EventType      | Converted into "dialer.exceeded" |
|   code    | TaskAttributes.code |       TaskAttributes.code        |
| timestamp |     TimestampMs     |      Timestamp UTC's string      |

 * @param twilioCustomDialerEvent
 */
export const twilioDialerExceededHandler = ({
  EventType, TimestampMs, TaskAttributes,
}: TwilioCustomDialerEvent): [DialerEvent] => {
  if (EventType !== TwilioCustomDialerEventsTypes.dialerExceeded) {
    throw new Error(`Only inputs of type '${TwilioCustomDialerEventsTypes.dialerExceeded}' can be handled by twilioDialerExceededHandler.`);
  }

  const taskAttributes = TaskAttributes && JSON.parse(TaskAttributes);

  return [{
    type: DialerEvents.dialerExceeded,
    code: taskAttributes && taskAttributes.code,
    timestamp: getTime(TimestampMs),
  }];
};

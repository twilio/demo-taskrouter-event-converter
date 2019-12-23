import { TwilioCustomDialerEvent, TwilioCustomDialerEventsTypes } from '..';
import { DialerEvent, DialerEvents } from '../../../teravoz';
import { getTime } from '../../../date';

/**
 * twilioDialerAttemptHandler converts `custom.dialer.attempt` to the
 * equivalent Teravoz's event `dialer.attempt`
 *
 * The `custom.dialer.attempt` is triggered right after a call is triggered on
 * the dialer implementation. This event is a custom event, so it's not a default
 * from Twilio; It's only triggered manually calling the endpoint responsible from listening dialer
 * custom events. Therefore, there's not a EventSid in Twilio to identify the
 * action that triggered this event.
 *
 * The structure of the conversion is:
 *
|  Teravoz  | Twilio Dialer Event |              Value              |
|:---------:|:-------------------:|:-------------------------------:|
|   type    |      EventType      | Converted into "dialer.attempt" |
|  number   |         To          |               To                |
|   code    | TaskAttributes.code |       TaskAttributes.code       |
| timestamp |     TimestampMs     |     Timestamp UTC's string      |

 * @param twilioCustomDialerEvent
 */
export const twilioDialerAttemptHandler = ({
  EventType,
  To,
  TimestampMs,
  TaskAttributes,
}: TwilioCustomDialerEvent): [DialerEvent] => {
  if (EventType !== TwilioCustomDialerEventsTypes.dialerAttempt) {
    throw new Error(
      `Only inputs of type '${TwilioCustomDialerEventsTypes.dialerAttempt}' can be handled by twilioDialerAttemptHandler.`,
    );
  }

  const taskAttributes = TaskAttributes && JSON.parse(TaskAttributes);

  return [
    {
      type: DialerEvents.dialerAttempt,
      number: To,
      code: taskAttributes && taskAttributes.code,
      timestamp: getTime(TimestampMs),
    },
  ];
};

import {
  TwilioCustomDialerEvent,
  TwilioCustomDialerEventsTypes,
  twilioAmdStatusToTeravoz,
} from '..';
import { DialerEvent, DialerEvents } from '../../../teravoz';
import { getTime } from '../../../date';

/**
 * twilioDialerSuccessHandler converts `custom.dialer.success` to the
 * equivalent Teravoz's event `dialer.success`
 *
 * The `custom.dialer.success` is triggered right after a call is accepted
 * and the AMD detects that the call was been answered by a human, and is
 * ready to be accepted by an agent.
 *
 * This event is a custom event, so it's not a default from Twilio;
 * It's only triggered manually calling the endpoint responsible from listening dialer
 * custom events. Therefore, there's not a EventSid in Twilio to identify the
 * action that triggered this event.
 *
 * The structure of the conversion is:
 *
|  Teravoz   | Twilio Dialer Event |                          Value                           |
|:----------:|:-------------------:|:--------------------------------------------------------:|
|    type    |      EventType      |             Converted into "dialer.success"              |
|   number   |         To          |                            To                            |
|    code    | TaskAttributes.code |                   TaskAttributes.code                    |
|  call_id   |       CallSid       |                         CallSid                          |
| amd_status |      AmdStatus      | Teravoz's amd_status property, mapped from the AmdStatus |
| timestamp  |     TimestampMs     |                  Timestamp UTC's string                  |

 * @param twilioCustomDialerEvent
 */
export const twilioDialerSuccessHandler = ({
  EventType,
  To,
  TimestampMs,
  AmdStatus,
  CallSid,
  TaskAttributes,
}: TwilioCustomDialerEvent): [DialerEvent] => {
  if (EventType !== TwilioCustomDialerEventsTypes.dialerSuccess) {
    throw new Error(
      `Only events of type '${TwilioCustomDialerEventsTypes.dialerSuccess}' can be handled by twilioDialerSuccessHandler.`,
    );
  }

  const taskAttributes = TaskAttributes && JSON.parse(TaskAttributes);

  return [
    {
      type: DialerEvents.dialerSuccess,
      number: To,
      code: taskAttributes && taskAttributes.code,
      call_id: CallSid,
      amd_status: twilioAmdStatusToTeravoz(AmdStatus),
      timestamp: getTime(TimestampMs),
    },
  ];
};

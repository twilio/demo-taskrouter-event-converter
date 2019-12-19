import { TwilioCustomDialerEvent, TwilioCustomDialerEventsTypes, twilioAmdStatusToTeravoz } from '..';
import { DialerEvent, DialerEvents } from '../../teravoz';
import { getTime } from '../../../date';

/**
 * twilioDialerFailureHandler converts `custom.dialer.failure` to the
 * equivalent Teravoz's event `dialer.failure`
 *
 * The `custom.dialer.attempt` is triggered right after a call is rejected
 * or the AMD detects an Answering Machine instead of a human.
 * This event is a custom event, so it's not a default from Twilio;
 * It's only triggered manually calling the endpoint responsible from listening dialer
 * custom events. Therefore, there's not a EventSid in Twilio to identify the
 * action that triggered this event.
 *
 * The structure of the conversion is:
 *
|  Teravoz  | Twilio Dialer Event |                        Value                         |
|:---------:|:-------------------:|:----------------------------------------------------:|
|   type    |      EventType      |           Converted into "dialer.attempt"            |
|  call_id  |       CallSid       |                       CallSid                        |
|   code    | TaskAttributes.code |                 TaskAttributes.code                  |
|  number   |         To          |                          To                          |
|  reason   |      AmdStatus      | Teravoz's reason property, mapped from the AmdStatus |
| timestamp |     TimestampMs     |                Timestamp UTC's string                |

 * @param twilioCustomDialerEvent
 */
export const twilioDialerFailureHandler = ({
  EventType, To, TimestampMs, CallSid, AmdStatus, TaskAttributes,
}: TwilioCustomDialerEvent): [DialerEvent] => {
  if (EventType !== TwilioCustomDialerEventsTypes.dialerFailure) {
    throw new Error(`Only inputs of type '${TwilioCustomDialerEventsTypes.dialerFailure}' can be handled by twilioDialerFailureHandler.`);
  }

  const amdStatus = twilioAmdStatusToTeravoz(AmdStatus);
  const taskAttributes = TaskAttributes && JSON.parse(TaskAttributes);

  return [{
    type: DialerEvents.dialerFailure,
    call_id: CallSid,
    code: taskAttributes && taskAttributes.code,
    number: To,
    reason: amdStatus || undefined,
    timestamp: getTime(TimestampMs),
  }];
};

import { UserInput, UserInputTypes } from '../index';
import { CallEvent, CallEvents } from '../../teravoz';
import { getTime } from '../../../date';

/**
 * twilioDialerSuccessHandler converts `custom.input.nps-provided` to the
 * equivalent Teravoz's event `input.data-provided`
 *
 * The `custom.input.nps-provided` is triggered after the call is finished and
 * the caller grades the NPS avaliation. This event is a custom event, so it's not
 * default from Twilio; It's only triggered manually calling the endpoint responsible
 * from listening input custom events. Therefore, there's not a EventSid in Twilio to
 * identify the action that triggered this event.
 *
 * The structure of the conversion is:
 *
|  Teravoz  | Twilio Input Event |                Value                |
|:---------:|:------------------:|:-----------------------------------:|
|   type    |     InputType      | Converted into "call.data-provided" |
|  call_id  |      CallSid       |               CallSid               |
|    nps    |       Digits       |               Digits                |
|   data    |       Digits       |               Digits                |
| timestamp |    TimestampMs     |       Timestamp UTC's string        |
 * > The nps property is an extra field that has the same information than the
 data field. The reason that it's exists is to give extended support to the customers
 that already receive the nps by this field, since in Teravoz the event `call.data-provided`
 was customizable

 * @param twilioCustomDialerEvent
 */
export const userInputNpsHandler = ({
  InputType, CallSid, Digits, TimestampMs,
}: UserInput): [CallEvent] => {
  if (InputType !== UserInputTypes.npsProvided) {
    throw new Error(`Only inputs of type '${UserInputTypes.npsProvided}' can be handled by userInputNpsHandler.`);
  }

  return [
    {
      type: CallEvents.dataProvided,
      call_id: CallSid,
      nps: Digits,
      data: Digits,
      timestamp: getTime(TimestampMs),
    },
  ];
};

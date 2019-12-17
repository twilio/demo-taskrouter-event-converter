import { TwilioCustomDialerEvent, TwilioCustomDialerEventsTypes, twilioAmdStatusToTeravoz } from '..';
import { DialerEvent, DialerEvents } from '../../teravoz';
import { getTime } from '../../../date';


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

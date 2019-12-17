import { TwilioCustomDialerEvent, TwilioCustomDialerEventsTypes, twilioAmdStatusToTeravoz } from '..';
import { DialerEvent, DialerEvents } from '../../teravoz';
import { getTime } from '../../../date';


export const twilioDialerFailureHandler = ({
  EventType, To, TimestampMs, CallSid, AmdStatus,
}: TwilioCustomDialerEvent): [DialerEvent] => {
  if (EventType !== TwilioCustomDialerEventsTypes.dialerFailure) {
    throw new Error(`Only inputs of type '${TwilioCustomDialerEventsTypes.dialerFailure}' can be handled by twilioDialerFailureHandler.`);
  }

  const amdStatus = twilioAmdStatusToTeravoz(AmdStatus);

  return [{
    type: DialerEvents.dialerFailure,
    call_id: CallSid,
    number: To,
    reason: amdStatus || undefined,
    timestamp: getTime(TimestampMs),
  }];
};

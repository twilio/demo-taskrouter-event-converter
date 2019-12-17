import { TwilioCustomDialerEvent, TwilioCustomDialerEventsTypes, twilioAmdStatusToTeravoz } from '..';
import { DialerEvent, DialerEvents } from '../../teravoz';
import { getTime } from '../../../date';

export const twilioDialerSuccessHandler = ({
  EventType, To, TimestampMs, AmdStatus, CallSid,
}: TwilioCustomDialerEvent): [DialerEvent] => {
  if (EventType !== TwilioCustomDialerEventsTypes.dialerSuccess) {
    throw new Error(`Only events of type '${TwilioCustomDialerEventsTypes.dialerSuccess}' can be handled by twilioDialerSuccessHandler.`);
  }

  return [{
    type: DialerEvents.dialerSuccess,
    number: To,
    call_id: CallSid,
    amd_status: twilioAmdStatusToTeravoz(AmdStatus),
    timestamp: getTime(TimestampMs),
  }];
};

import { UserInput, UserInputTypes } from '../index';
import { CallEvent, CallEvents } from '../../teravoz';
import { getTime } from '../../../date';

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
      sid: '',
    },
  ];
};

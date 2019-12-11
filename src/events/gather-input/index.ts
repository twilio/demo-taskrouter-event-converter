import { TeravozEvent } from '../teravoz';
import { inputMapping } from './input-map';

export enum UserInputTypes {
  npsProvided = 'custom.nps-provided'
}

export interface UserInput {
  InputType: UserInputTypes;
  CallSid: string;
  Digits: string;
  TimestampMs: string;
}

export const gatherInputConverter = (event: UserInput): TeravozEvent[] => {
  const mapEvent = inputMapping[event.InputType];

  if (mapEvent) {
    return mapEvent(event);
  }

  return [];
};

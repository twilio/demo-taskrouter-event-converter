import { TeravozEvent } from '../teravoz';
import { inputMapping } from './input-map';
import { converter } from '../converter';

export enum UserInputTypes {
  npsProvided = 'custom.nps-provided'
}

export interface UserInput {
  InputType: UserInputTypes;
  CallSid: string;
  Digits: string;
  TimestampMs: string;
}

export const gatherInputConverter = (event: UserInput): TeravozEvent[] => converter(inputMapping, event.InputType, event);

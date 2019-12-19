import { TeravozEvent } from '../teravoz';
import { inputMapping } from './input-map';
import { converter } from '../converter';

/**
 * UserInputTypes contains the InputTypes related to
 * the gathering phase of a call. These event names are defined manually,
 * so it can be changed or added as you will
 */
export enum UserInputTypes {
  npsProvided = 'custom.nps-provided'
}

/**
 * UserInput represents the structure of the object that will be provided
 * when the user provides a information to the call, such as providing a
 * CPF or answering the satisfaction survey.
 */
export interface UserInput {
  InputType: UserInputTypes;
  CallSid: string;
  Digits: string;
  TimestampMs: string;
}

/**
 * gatherInputConverter receives the input object received by gathering
 * the callee info and convert it to a valid Teravoz's event, like
 * `call.data-provided`.
 *
 * @param event The input to be converted
 */
export const gatherInputConverter = (event: UserInput): TeravozEvent[] => converter(inputMapping, event.InputType, event);

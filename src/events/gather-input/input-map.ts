import { TeravozEvent } from '../teravoz';
import { userInputNpsHandler } from './nps';
import { UserInput, UserInputTypes } from '.';

type Handler = (input: UserInput) => TeravozEvent[];

type InputMapping = {
  [K in UserInputTypes]?: Handler
}

export const inputMapping: InputMapping = {
  'custom.nps-provided': userInputNpsHandler,
};

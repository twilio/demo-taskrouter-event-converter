import { userInputNpsHandler } from '.';
import { UserInput, UserInputTypes } from '..';

describe('Convert custom.nps-provided', (): void => {
  test('Should convert custom.nps-provided to custom.nps-provided', (): void => {
    const input: UserInput = {
      InputType: UserInputTypes.npsProvided,
      CallSid: 'CA123',
      Digits: '5',
      TimestampMs: Date.now().toString(),
    };

    // @ts-ignore
    const events = userInputNpsHandler(input);
    expect(events).not.toBeFalsy();
    expect(events).toBeInstanceOf(Array);
    expect(events.length).toBe(1);

    const [event] = events;

    expect(event.type).toBe('call.data-provided');
    expect(event.call_id).toBe(input.CallSid);
    expect(event.data).toBe(input.Digits);
    expect(event.nps).toBe(input.Digits);
    expect(event.timestamp).toStrictEqual(expect.any(String));
  });
});

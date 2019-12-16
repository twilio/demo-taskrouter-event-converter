import { twilioDialerAttemptHandler } from '.';
import { TwilioCustomDialerEvent, TwilioCustomDialerEventsTypes } from '..';

describe('Convert custom.dialer.attempt', (): void => {
  test('Should convert custom.dialer.attempt to dialer.attempt', (): void => {
    const input: TwilioCustomDialerEvent = {
      EventType: TwilioCustomDialerEventsTypes.dialerAttempt,
      CallSid: 'CA123',
      To: '+1122344445555',
      TimestampMs: Date.now().toString(),
    };

    const [event] = twilioDialerAttemptHandler(input);

    expect(event.type).toBe('dialer.attempt');
    expect(event.number).toBe(input.To);
    expect(event.timestamp).toStrictEqual(expect.any(String));
  });

  test('Should thrown an error if the event passed is different from \'custom.dialer.attempt\'', (): void => {
    const input = {
      EventType: 'custom.dialer.wrongtype',
      CallSid: 'CA123',
      To: '+1122344445555',
      TimestampMs: Date.now().toString(),
    };

    expect(() => {
      twilioDialerAttemptHandler(input as any);
    }).toThrow();
  });
});

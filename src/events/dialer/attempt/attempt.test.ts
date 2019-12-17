import { twilioDialerAttemptHandler } from '.';
import { TwilioCustomDialerEvent, TwilioCustomDialerEventsTypes } from '..';

describe('Convert custom.dialer.attempt', (): void => {
  test('Should convert custom.dialer.attempt to dialer.attempt', (): void => {
    const taskAttr = {
      code: 'abcdef-12345-abcdef',
    };

    const input: TwilioCustomDialerEvent = {
      EventType: TwilioCustomDialerEventsTypes.dialerAttempt,
      CallSid: 'CA123',
      To: '+1122344445555',
      TimestampMs: Date.now().toString(),
      TaskAttributes: JSON.stringify(taskAttr),
    };

    const [event] = twilioDialerAttemptHandler(input);

    expect(event.type).toBe('dialer.attempt');
    expect(event.number).toBe(input.To);
    expect(event.code).toBe(taskAttr.code);
    expect(event.timestamp).toStrictEqual(expect.any(String));
  });

  test('Should thrown an error if the event passed is different from \'custom.dialer.attempt\'', (): void => {
    const taskAttr = {
      code: 'abcdef-12345-abcdef',
    };

    const input = {
      EventType: 'custom.dialer.wrongtype',
      CallSid: 'CA123',
      To: '+1122344445555',
      TimestampMs: Date.now().toString(),
      TaskAttributes: JSON.stringify(taskAttr),
    };

    expect(() => {
      twilioDialerAttemptHandler(input as any);
    }).toThrow();
  });
});

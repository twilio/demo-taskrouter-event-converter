import { twilioDialerExpiredHandler } from '.';
import { TwilioCustomDialerEvent, TwilioCustomDialerEventsTypes } from '..';

describe('Convert custom.dialer.expired', (): void => {
  test('Should convert custom.dialer.expired to dialer.expired', (): void => {
    const taskAttr = {
      code: 'abcdef-12345-abcdef',
    };

    const input: TwilioCustomDialerEvent = {
      EventType: TwilioCustomDialerEventsTypes.dialerExpired,
      CallSid: 'CA123',
      To: '+1122344445555',
      TimestampMs: Date.now().toString(),
      TaskAttributes: JSON.stringify(taskAttr),
    };

    const [event] = twilioDialerExpiredHandler(input);

    expect(event.type).toBe('dialer.expired');
    expect(event.code).toBe(taskAttr.code);
    expect(event.timestamp).toStrictEqual(expect.any(String));
  });

  test('Should thrown an error if the event passed is different from \'custom.dialer.expired\'', (): void => {
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
      twilioDialerExpiredHandler(input as any);
    }).toThrow();
  });
});

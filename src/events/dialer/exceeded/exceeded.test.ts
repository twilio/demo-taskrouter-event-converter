import { twilioDialerExceededHandler } from '.';
import { TwilioCustomDialerEvent, TwilioCustomDialerEventsTypes } from '..';

describe('Convert custom.dialer.exceeded', (): void => {
  test('Should convert custom.dialer.exceeded to dialer.exceeded', (): void => {
    const taskAttr = {
      code: 'abcdef-12345-abcdef',
    };

    const input: TwilioCustomDialerEvent = {
      EventType: TwilioCustomDialerEventsTypes.dialerExceeded,
      CallSid: 'CA123',
      To: '+1122344445555',
      TimestampMs: Date.now().toString(),
      TaskAttributes: JSON.stringify(taskAttr),
    };

    const [event] = twilioDialerExceededHandler(input);

    expect(event.type).toBe('dialer.exceeded');
    expect(event.code).toBe(taskAttr.code);
    expect(event.timestamp).toStrictEqual(expect.any(String));
  });

  test("Should thrown an error if the event passed is different from 'custom.dialer.exceeded'", (): void => {
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
      twilioDialerExceededHandler(input as any);
    }).toThrow();
  });
});

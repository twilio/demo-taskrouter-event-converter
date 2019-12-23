import { twilioDialerFailureHandler } from '.';
import { TwilioCustomDialerEvent, TwilioCustomDialerEventsTypes } from '..';

describe('Convert custom.dialer.failure', (): void => {
  test('Should convert custom.dialer.failure to dialer.failure', (): void => {
    const taskAttr = {
      code: 'abcdef-12345-abcdef',
    };

    const input: TwilioCustomDialerEvent = {
      EventType: TwilioCustomDialerEventsTypes.dialerFailure,
      CallSid: 'CA123',
      To: '+1122344445555',
      TimestampMs: Date.now().toString(),
      AmdStatus: 'machine_start',
      TaskAttributes: JSON.stringify(taskAttr),
    };

    const [event] = twilioDialerFailureHandler(input);

    expect(event.type).toBe('dialer.failure');
    expect(event.call_id).toBe(input.CallSid);
    expect(event.number).toBe(input.To);
    expect(event.code).toBe(taskAttr.code);
    expect(event.reason).toBe('machine');
    expect(event.timestamp).toStrictEqual(expect.any(String));
  });

  test("Should thrown an error if the event passed is different from 'custom.dialer.failure'", (): void => {
    const input = {
      EventType: 'custom.data.wrongtype',
      CallSid: 'CA123',
      To: '+1122344445555',
      TimestampMs: Date.now().toString(),
      Reason: 'machine',
    };

    expect(() => {
      twilioDialerFailureHandler(input as any);
    }).toThrow();
  });
});

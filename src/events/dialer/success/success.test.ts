import { twilioDialerSuccessHandler } from '.';
import { TwilioCustomDialerEvent, TwilioCustomDialerEventsTypes } from '..';

describe('Convert custom.dialer.success', (): void => {
  test('Should convert custom.dialer.success to dialer.success', (): void => {
    const taskAttr = {
      code: 'abcdef-12345-abcdef',
    };

    const input: TwilioCustomDialerEvent = {
      EventType: TwilioCustomDialerEventsTypes.dialerSuccess,
      CallSid: 'CA123',
      To: '+1122344445555',
      TimestampMs: Date.now().toString(),
      AmdStatus: 'human',
      TaskAttributes: JSON.stringify(taskAttr),
    };

    const [event] = twilioDialerSuccessHandler(input);

    expect(event.type).toBe('dialer.success');
    expect(event.call_id).toBe(input.CallSid);
    expect(event.number).toBe(input.To);
    expect(event.code).toBe(taskAttr.code);
    expect(event.amd_status).toBe('human');
    expect(event.timestamp).toStrictEqual(expect.any(String));
  });

  test("Should thrown an error if the event passed is different from 'custom.dialer.success'", (): void => {
    const input = {
      EventType: 'custom.dialer.wrongtype',
      CallSid: 'CA123',
      To: '+1122344445555',
      TimestampMs: Date.now().toString(),
      AmdStatus: 'human',
    };

    expect(() => {
      twilioDialerSuccessHandler(input as any);
    }).toThrow();
  });
});

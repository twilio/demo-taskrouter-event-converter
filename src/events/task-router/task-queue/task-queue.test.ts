import { taskQueueEnteredHandler } from '.';

describe('Convert task-queue.entered', (): void => {
  test('Should convert task-queue.entered to call.waiting', (): void => {
    const taskAttr = {
      call_sid: 'CA123',
      direction: 'inbound',
      called: '5511911111111',
      from: '5511922222222',
    };

    const input = {
      EventType: 'task-queue.entered',
      TaskAttributes: JSON.stringify(taskAttr),
      TaskQueueSid: 'TQ123',
      TaskQueueName: 'Queue 900',
      TimestampMs: Date.now(),
    };

    const events = taskQueueEnteredHandler(input);

    expect(events).not.toBeFalsy();
    expect(events).toBeInstanceOf(Array);
    expect(events.length).toBe(1);

    const [queueEvent] = events;

    expect(queueEvent.type).toBe('call.waiting');
    expect(queueEvent.call_id).toBe(taskAttr.call_sid);
    expect(queueEvent.direction).toBe(taskAttr.direction);
    expect(queueEvent.our_number).toBe(taskAttr.called);
    expect(queueEvent.their_number).toBe(taskAttr.from);
    expect(queueEvent.queue).toBe(input.TaskQueueSid);
    expect(queueEvent.timestamp).toStrictEqual(expect.any(String));
  });

  test('Should throw an error if the event passed to the handler is different from task-queue.entered', (): void => {
    const taskAttr = {
      call_sid: 'CA123',
      direction: 'inbound',
      called: '5511911111111',
      from: '5511922222222',
    };

    const invalidInput = {
      EventType: 'task-queue.canceled',
      TaskAttributes: JSON.stringify(taskAttr),
      TaskQueueSid: 'TQ123',
      TaskQueueName: 'Queue 900',
      TimestampMs: Date.now(),
    };

    expect(() => {
      taskQueueEnteredHandler(invalidInput);
    }).toThrow();
  });
});

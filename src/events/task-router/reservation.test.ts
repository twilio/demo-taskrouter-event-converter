import { taskRouterEventConverter } from './index';

describe('Convert reservation.accepted', (): void => {
  test('Should convert reservation.accepted to agent.entered and call.ongoing', (): void => {
    const taskAttr = {
      call_sid: 'CA123',
      direction: 'inbound',
      called: '5511911111111',
      from: '5511922222222',
    };

    const input = {
      EventType: 'reservation.accepted',
      TaskAttributes: JSON.stringify(taskAttr),
      WorkerName: 'test',
      WorkerSid: 'WW123',
      TaskQueueSid: 'TQ123',
      TimestampMs: Date.now(),
    };

    const events = taskRouterEventConverter(input);

    expect(events).not.toBeFalsy();
    expect(events).toBeInstanceOf(Array);
    expect(events.length).toBe(2);

    const [actorEvent, callEvent] = events;

    expect(actorEvent.type).toBe('actor.entered');
    expect(actorEvent.call_id).toBe(taskAttr.call_sid);
    expect(actorEvent.actor).toBe(input.WorkerName);
    expect(actorEvent.number).toBe(input.WorkerSid);
    expect(actorEvent.queue).toBe(input.TaskQueueSid);
    expect(actorEvent.timestamp).toStrictEqual(expect.any(String));

    expect(callEvent.type).toBe('call.ongoing');
    expect(callEvent.call_id).toBe(taskAttr.call_sid);
    expect(callEvent.direction).toBe(taskAttr.direction);
    expect(callEvent.our_number).toBe(taskAttr.called);
    expect(callEvent.their_number).toBe(taskAttr.from);
    expect(callEvent.timestamp).toStrictEqual(expect.any(String));
  });
});

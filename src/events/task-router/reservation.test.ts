import { taskRouterEventConverter } from './index';

describe('Convert reservation.accepted', (): void => {
  test('Should convert reservation.accepted to agent.entered and call.ongoing', (): void => {
    const taskAttr = {
      call_sid: 'CA123',
      direction: 'inbound',
      called: '5511911111111',
      from: '5511922222222',
    };

    const workerAttr = {
      contact_uri: 'client:test',
    };

    const input = {
      EventType: 'reservation.accepted',
      TaskAttributes: JSON.stringify(taskAttr),
      WorkerAttributes: JSON.stringify(workerAttr),
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
    expect(actorEvent.number).toBe(workerAttr.contact_uri);
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

describe('Convert reservation.rejected', (): void => {
  const taskAttr = {
    call_sid: 'CA123',
    direction: 'inbound',
    called: '5511911111111',
    from: '5511922222222',
  };

  const workerAttr = {
    contact_uri: 'client:test',
  };

  const input = {
    EventType: 'reservation.rejected',
    TaskAttributes: JSON.stringify(taskAttr),
    WorkerAttributes: JSON.stringify(workerAttr),
    WorkerName: 'test',
    WorkerSid: 'WW123',
    TaskQueueSid: 'TQ123',
    TaskAge: '42',
    TimestampMs: Date.now(),
  };

  const events = taskRouterEventConverter(input);

  expect(events).not.toBeFalsy();
  expect(events).toBeInstanceOf(Array);
  expect(events.length).toBe(1);

  const [event] = events;

  expect(event.type).toBe('actor.noanswer');
  expect(event.actor).toBe(input.WorkerName);
  expect(event.number).toBe(workerAttr.contact_uri);
  expect(event.ringtime).toBe(input.TaskAge);
  expect(event.queue).toBe(input.TaskQueueSid);
  expect(event.call_id).toBe(taskAttr.call_sid);
  expect(event.timestamp).toStrictEqual(expect.any(String));
});

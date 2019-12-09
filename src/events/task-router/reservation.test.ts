import { reservationAcceptedHandler, reservationRejectedHandler } from './reservation';

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

    const events = reservationAcceptedHandler(input);

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

  test('Should throw an error if the event passed to the handler is different from reservation.accepted', (): void => {
    const taskAttr = {
      call_sid: 'CA123',
      direction: 'inbound',
      called: '5511911111111',
      from: '5511922222222',
    };

    const workerAttr = {
      contact_uri: 'client:test',
    };

    const invalidInput = {
      EventType: 'reservation.declined',
      TaskAttributes: JSON.stringify(taskAttr),
      WorkerAttributes: JSON.stringify(workerAttr),
      WorkerName: 'test',
      WorkerSid: 'WW123',
      TaskQueueSid: 'TQ123',
      TimestampMs: Date.now(),
    };

    expect(() => {
      reservationAcceptedHandler(invalidInput);
    }).toThrow();
  });
});

describe('Convert reservation.rejected', (): void => {
  test('Should convert reservation.rejected to actor.noanswer', (): void => {
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

    const events = reservationRejectedHandler(input);

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

  test('Should throw an error if the event passed to the handler is different from actor.noanswer', (): void => {
    const taskAttr = {
      call_sid: 'CA123',
      direction: 'inbound',
      called: '5511911111111',
      from: '5511922222222',
    };

    const workerAttr = {
      contact_uri: 'client:test',
    };

    const invalidInput = {
      EventType: 'reservation.accepted',
      TaskAttributes: JSON.stringify(taskAttr),
      WorkerAttributes: JSON.stringify(workerAttr),
      WorkerName: 'test',
      WorkerSid: 'WW123',
      TaskQueueSid: 'TQ123',
      TaskAge: '42',
      TimestampMs: Date.now(),
    };

    expect(() => {
      reservationRejectedHandler(invalidInput);
    }).toThrow();
  });
});

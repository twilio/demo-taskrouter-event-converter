import { taskCreatedHandler, taskCanceledHandler, taskWrapupHandler } from '.';

describe('Convert task.created', (): void => {
  test('Should convert task.created to call.new', (): void => {
    const taskAttr = {
      call_sid: 'CA123',
      direction: 'inbound',
      called: '5511911111111',
      from: '5511922222222',
    };

    const input = {
      EventType: 'task.created',
      TaskAttributes: JSON.stringify(taskAttr),
      TimestampMs: Date.now(),
      Sid: 'EV123',
    };

    // @ts-ignore
    const events = taskCreatedHandler(input);

    expect(events).not.toBeFalsy();
    expect(events).toBeInstanceOf(Array);
    expect(events.length).toBe(1);

    const [{
      type, call_id, direction, our_number, their_number, timestamp, sid,
    }] = events;

    expect(type).toBe('call.new');
    expect(call_id).toBe(taskAttr.call_sid);
    expect(direction).toBe(taskAttr.direction);
    expect(our_number).toBe(taskAttr.called);
    expect(their_number).toBe(taskAttr.from);
    expect(timestamp).toStrictEqual(expect.any(String));
    expect(sid).toBe(input.Sid);
  });

  test('Should throw an error if the event passed to the handler is different from task.created', (): void => {
    const taskAttr = {
      call_sid: 'CA123',
      direction: 'inbound',
      called: '5511911111111',
      from: '5511922222222',
    };

    const wrongInput = {
      EventType: 'task.update',
      TaskAttributes: JSON.stringify(taskAttr),
      TimestampMs: Date.now(),
      Sid: 'EV123',
    };

    expect(() => {
      // @ts-ignore
      taskCreatedHandler(wrongInput);
    }).toThrow();
  });
});

describe('Convert task.canceled', (): void => {
  test('Should convert task.canceled to call.queue-abandon', (): void => {
    const taskAttr = {
      call_sid: 'CA123',
    };

    const input = {
      EventType: 'task.canceled',
      TaskAttributes: JSON.stringify(taskAttr),
      TimestampMs: Date.now(),
      Sid: 'EV123',
    };

    // @ts-ignore
    const events = taskCanceledHandler(input);

    expect(events).not.toBeFalsy();
    expect(events).toBeInstanceOf(Array);
    expect(events.length).toBe(1);

    const [{
      type, call_id, timestamp, sid,
    }] = events;

    expect(type).toBe('call.queue-abandon');
    expect(call_id).toBe(taskAttr.call_sid);
    expect(timestamp).toStrictEqual(expect.any(String));
    expect(sid).toBe(input.Sid);
  });

  test('Should throw an error if the event passed to the handler is different from task.canceled', (): void => {
    const taskAttr = {
      call_sid: 'CA123',
    };

    const invalidInput = {
      EventType: 'task.created',
      TaskAttributes: JSON.stringify(taskAttr),
      TimestampMs: Date.now(),
      Sid: 'EV123',
    };

    expect(() => {
      // @ts-ignore
      taskCanceledHandler(invalidInput);
    }).toThrow();
  });
});

describe('Convert task.wrapup', (): void => {
  test('Should convert task.wrapup to call.finished AND actor.left', (): void => {
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
      EventType: 'task.wrapup',
      TaskAttributes: JSON.stringify(taskAttr),
      WorkerAttributes: JSON.stringify(workerAttr),
      TimestampMs: Date.now(),
      WorkerName: 'TWorker',
      WorkerSid: 'WW123',
      TaskQueueSid: 'TQ123',
      Sid: 'EV123',
    };

    // @ts-ignore
    const events = taskWrapupHandler(input);

    expect(events).not.toBeFalsy();
    expect(events).toBeInstanceOf(Array);
    expect(events.length).toBe(2);

    const [callEvent, agentEvent] = events;

    expect(callEvent.type).toBe('call.finished');
    expect(callEvent.call_id).toBe(taskAttr.call_sid);
    expect(callEvent.direction).toBe(taskAttr.direction);
    expect(callEvent.our_number).toBe(taskAttr.called);
    expect(callEvent.their_number).toBe(taskAttr.from);
    expect(callEvent.timestamp).toStrictEqual(expect.any(String));
    expect(callEvent.sid).toBe(input.Sid);

    expect(agentEvent.type).toBe('actor.left');
    expect(agentEvent.call_id).toBe(taskAttr.call_sid);
    expect(agentEvent.actor).toBe(input.WorkerName);
    expect(agentEvent.number).toBe(workerAttr.contact_uri);
    expect(agentEvent.queue).toBe(input.TaskQueueSid);
    expect(agentEvent.timestamp).toStrictEqual(expect.any(String));
    expect(agentEvent.sid).toBe(input.Sid);
  });

  test('Should throw an error if the event passed to the handler is different from task.wrapup', (): void => {
    const taskAttr = {
      call_sid: 'CA123',
    };

    const invalidInput = {
      EventType: 'task.created',
      TaskAttributes: JSON.stringify(taskAttr),
      TimestampMs: Date.now(),
      Sid: 'EV123',
    };

    expect(() => {
      // @ts-ignore
      taskWrapupHandler(invalidInput);
    }).toThrow();
  });
});

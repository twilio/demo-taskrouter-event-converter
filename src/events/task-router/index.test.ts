/* eslint-disable @typescript-eslint/camelcase */
import { taskRouterEventHandler } from './index';

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
    };

    const events = taskRouterEventHandler(input);

    expect(events).not.toBeFalsy();
    expect(events).toBeInstanceOf(Array);
    expect(events.length).toBe(1);

    const [{
      type, call_id, direction, our_number, their_number, timestamp,
    }] = events;

    expect(type).toBe('call.new');
    expect(call_id).toBe(taskAttr.call_sid);
    expect(direction).toBe(taskAttr.direction);
    expect(our_number).toBe(taskAttr.called);
    expect(their_number).toBe(taskAttr.from);
    expect(timestamp).toStrictEqual(expect.any(String));
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
    };

    const events = taskRouterEventHandler(input);

    expect(events).not.toBeFalsy();
    expect(events).toBeInstanceOf(Array);
    expect(events.length).toBe(1);

    const [{
      type, call_id, timestamp,
    }] = events;

    expect(type).toBe('call.queue-abandon');
    expect(call_id).toBe(taskAttr.call_sid);
    expect(timestamp).toStrictEqual(expect.any(String));
  });
});

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

    const events = taskRouterEventHandler(input);

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

const assertEvent = (input: any, event: any, expectedEv: string): void => {
  expect(event.type).toBe(expectedEv);
  expect(event.actor).toBe(input.WorkerName);
  expect(event.number).toBe(input.WorkerSid);
  expect(event.timestamp).toStrictEqual(expect.any(String));
};

describe('Convert worker.activity.update', () => {
  describe('Activity offline -> *', (): void => {
    test("Shouldn't convert worker.activity.update (offline -> offline) to any event", (): void => {
      const input = {
        EventType: 'worker.activity.update',
        WorkerName: 'test',
        WorkerSid: 'WW123',
        WorkerActivityName: 'offline',
        WorkerPreviousActivityName: 'offline',
        TimestampMs: Date.now(),
      };

      const events = taskRouterEventHandler(input);
      expect(events).not.toBeFalsy();
      expect(events).toBeInstanceOf(Array);
      expect(events.length).toBe(0);
    });

    test("Shouldn't convert worker.activity.update (offline -> unavaliable) to any event", (): void => {
      const input = {
        EventType: 'worker.activity.update',
        WorkerName: 'test',
        WorkerSid: 'WW123',
        WorkerActivityName: 'unavaliable',
        WorkerPreviousActivityName: 'offline',
        TimestampMs: Date.now(),
      };

      const events = taskRouterEventHandler(input);
      expect(events).not.toBeFalsy();
      expect(events).toBeInstanceOf(Array);
      expect(events.length).toBe(0);
    });

    test('Should convert worker.activity.update (offline -> available) to actor.logged-in', (): void => {
      const input = {
        EventType: 'worker.activity.update',
        WorkerName: 'test',
        WorkerSid: 'WW123',
        WorkerActivityName: 'available',
        WorkerPreviousActivityName: 'offline',
        TimestampMs: Date.now(),
      };

      const events = taskRouterEventHandler(input);
      expect(events).not.toBeFalsy();
      expect(events).toBeInstanceOf(Array);
      expect(events.length).toBe(1);

      const [event] = events;

      assertEvent(input, event, 'actor.logged-in');
    });

    // TODO: review this rule
    test('Should convert worker.activity.update (offline -> break) to actor.paused', (): void => {
      const input = {
        EventType: 'worker.activity.update',
        WorkerName: 'test',
        WorkerSid: 'WW123',
        WorkerActivityName: 'break',
        WorkerPreviousActivityName: 'offline',
        TimestampMs: Date.now(),
      };

      const events = taskRouterEventHandler(input);
      expect(events).not.toBeFalsy();
      expect(events).toBeInstanceOf(Array);
      expect(events.length).toBe(1);

      const [event] = events;

      assertEvent(input, event, 'actor.paused');
    });
  });

  describe('Activity unavailable -> *', (): void => {
    test("Shouldn't convert worker.activity.update (unavailable -> unavailable) to any event", (): void => {
      const input = {
        EventType: 'worker.activity.update',
        WorkerName: 'test',
        WorkerSid: 'WW123',
        WorkerActivityName: 'unavailable',
        WorkerPreviousActivityName: 'unavailable',
        TimestampMs: Date.now(),
      };

      const events = taskRouterEventHandler(input);
      expect(events).not.toBeFalsy();
      expect(events).toBeInstanceOf(Array);
      expect(events.length).toBe(0);
    });

    test("Shouldn't convert worker.activity.update (unavailable -> offline) to any event", (): void => {
      const input = {
        EventType: 'worker.activity.update',
        WorkerName: 'test',
        WorkerSid: 'WW123',
        WorkerActivityName: 'offline',
        WorkerPreviousActivityName: 'unavailable',
        TimestampMs: Date.now(),
      };

      const events = taskRouterEventHandler(input);
      expect(events).not.toBeFalsy();
      expect(events).toBeInstanceOf(Array);
      expect(events.length).toBe(0);
    });

    test('Should convert worker.activity.update (unavailable -> available) to actor.logged-in', (): void => {
      const input = {
        EventType: 'worker.activity.update',
        WorkerName: 'test',
        WorkerSid: 'WW123',
        WorkerActivityName: 'available',
        WorkerPreviousActivityName: 'unavailable',
        TimestampMs: Date.now(),
      };

      const events = taskRouterEventHandler(input);
      expect(events).not.toBeFalsy();
      expect(events).toBeInstanceOf(Array);
      expect(events.length).toBe(1);

      const [event] = events;

      assertEvent(input, event, 'actor.logged-in');
    });

    test('Should convert worker.activity.update (unavailable -> break) to actor.paused', (): void => {
      const input = {
        EventType: 'worker.activity.update',
        WorkerName: 'test',
        WorkerSid: 'WW123',
        WorkerActivityName: 'break',
        WorkerPreviousActivityName: 'unavailable',
        TimestampMs: Date.now(),
      };

      const events = taskRouterEventHandler(input);
      expect(events).not.toBeFalsy();
      expect(events).toBeInstanceOf(Array);
      expect(events.length).toBe(1);

      const [event] = events;

      assertEvent(input, event, 'actor.paused');
    });
  });

  describe('Activity available -> *', (): void => {
    test("Shouldn't convert worker.activity.update (available -> available) to any event", (): void => {
      const input = {
        EventType: 'worker.activity.update',
        WorkerName: 'test',
        WorkerSid: 'WW123',
        WorkerActivityName: 'available',
        WorkerPreviousActivityName: 'available',
        TimestampMs: Date.now(),
      };

      const events = taskRouterEventHandler(input);
      expect(events).not.toBeFalsy();
      expect(events).toBeInstanceOf(Array);
      expect(events.length).toBe(0);
    });

    test('Should convert worker.activity.update (available -> offline) to actor.logged-out', (): void => {
      const input = {
        EventType: 'worker.activity.update',
        WorkerName: 'test',
        WorkerSid: 'WW123',
        WorkerActivityName: 'offline',
        WorkerPreviousActivityName: 'available',
        TimestampMs: Date.now(),
      };

      const events = taskRouterEventHandler(input);
      expect(events).not.toBeFalsy();
      expect(events).toBeInstanceOf(Array);
      expect(events.length).toBe(1);

      const [event] = events;

      assertEvent(input, event, 'actor.logged-out');
    });

    test('Should convert worker.activity.update (available -> unavailable) to acctor.logged-out', (): void => {
      const input = {
        EventType: 'worker.activity.update',
        WorkerName: 'test',
        WorkerSid: 'WW123',
        WorkerActivityName: 'unavailable',
        WorkerPreviousActivityName: 'available',
        TimestampMs: Date.now(),
      };

      const events = taskRouterEventHandler(input);
      expect(events).not.toBeFalsy();
      expect(events).toBeInstanceOf(Array);
      expect(events.length).toBe(1);

      const [event] = events;

      assertEvent(input, event, 'actor.logged-out');
    });

    test('Should convert worker.activity.update (available -> break) to actor.paused', (): void => {
      const input = {
        EventType: 'worker.activity.update',
        WorkerName: 'test',
        WorkerSid: 'WW123',
        WorkerActivityName: 'break',
        WorkerPreviousActivityName: 'available',
        TimestampMs: Date.now(),
      };

      const events = taskRouterEventHandler(input);
      expect(events).not.toBeFalsy();
      expect(events).toBeInstanceOf(Array);
      expect(events.length).toBe(1);

      const [event] = events;

      assertEvent(input, event, 'actor.paused');
    });
  });

  describe('Activity break -> *', (): void => {
    test("Shouldn't convert worker.activity.updat (break -> break) to any event", (): void => {
      const input = {
        EventType: 'worker.activity.update',
        WorkerName: 'test',
        WorkerSid: 'WW123',
        WorkerActivityName: 'break',
        WorkerPreviousActivityName: 'break',
        TimestampMs: Date.now(),
      };

      const events = taskRouterEventHandler(input);
      expect(events).not.toBeFalsy();
      expect(events).toBeInstanceOf(Array);
      expect(events.length).toBe(0);
    });

    test('Should convert worker.activity.update (break -> available) to actor.unpaused', (): void => {
      const input = {
        EventType: 'worker.activity.update',
        WorkerName: 'test',
        WorkerSid: 'WW123',
        WorkerActivityName: 'available',
        WorkerPreviousActivityName: 'break',
        TimestampMs: Date.now(),
      };

      const events = taskRouterEventHandler(input);
      expect(events).not.toBeFalsy();
      expect(events).toBeInstanceOf(Array);
      expect(events.length).toBe(1);

      const [event] = events;

      assertEvent(input, event, 'actor.unpaused');
    });

    test('Should convert worker.activity.update (break -> unavailable) to actor.logged-out', (): void => {
      const input = {
        EventType: 'worker.activity.update',
        WorkerName: 'test',
        WorkerSid: 'WW123',
        WorkerActivityName: 'unavailable',
        WorkerPreviousActivityName: 'break',
        TimestampMs: Date.now(),
      };

      const events = taskRouterEventHandler(input);
      expect(events).not.toBeFalsy();
      expect(events).toBeInstanceOf(Array);
      expect(events.length).toBe(1);

      const [event] = events;

      assertEvent(input, event, 'actor.logged-out');
    });

    test('Should convert worker.activity.update (break -> offline) to actor.logged-out', (): void => {
      const input = {
        EventType: 'worker.activity.update',
        WorkerName: 'test',
        WorkerSid: 'WW123',
        WorkerActivityName: 'offline',
        WorkerPreviousActivityName: 'break',
        TimestampMs: Date.now(),
      };

      const events = taskRouterEventHandler(input);
      expect(events).not.toBeFalsy();
      expect(events).toBeInstanceOf(Array);
      expect(events.length).toBe(1);

      const [event] = events;

      assertEvent(input, event, 'actor.logged-out');
    });
  });
});

describe('Misc', () => {
  test('Should return an empty array if an unhandled event is passed in', () => {
    const events = taskRouterEventHandler({
      EventType: 'not.handled',
    });

    expect(events).not.toBeFalsy();
    expect(events).toBeInstanceOf(Array);
    expect(events.length).toBe(0);
  });

  test('Should return an empty array if EventType is not provided', () => {
    const events = taskRouterEventHandler({});

    expect(events).not.toBeFalsy();
    expect(events).toBeInstanceOf(Array);
    expect(events.length).toBe(0);
  });
});

import { workerActivityUpdateHandler } from '.';

const workerAttr = {
  contact_uri: 'client:test',
  queues: ['900'],
};

const assertEvent = (input: any, event: any, expectedEv: string): void => {
  expect(event.type).toBe(expectedEv);
  expect(event.actor).toBe(input.WorkerName);
  expect(event.number).toBe(workerAttr.contact_uri);
  expect(event.timestamp).toStrictEqual(expect.any(String));
  expect(event.sid).toBe(input.Sid);
  expect(event.queue).toBe('900');
};

describe('Convert worker.activity.update', () => {
  describe('Any Activity -> *', (): void => {
    test("Shouldn't convert to a Teravoz's event if the Worker doesn't belongs to any queue", (): void => {
      const input = {
        EventType: 'worker.activity.update',
        WorkerName: 'test',
        WorkerSid: 'WW123',
        WorkerActivityName: 'Available',
        WorkerPreviousActivityName: 'Offline',
        WorkerAttributes: JSON.stringify({ contact_uri: 'client:test' }),
        TimestampMs: Date.now(),
        Sid: 'EV123',
      };

      // @ts-ignore
      const events = workerActivityUpdateHandler(input);
      expect(events).not.toBeFalsy();
      expect(events).toBeInstanceOf(Array);
      expect(events.length).toBe(0);
    });

    test('Should emit an event for each queue that the Worker belongs to', (): void => {
      const input = {
        EventType: 'worker.activity.update',
        WorkerName: 'test',
        WorkerSid: 'WW123',
        WorkerActivityName: 'Available',
        WorkerPreviousActivityName: 'Offline',
        WorkerAttributes: JSON.stringify({ ...workerAttr, queues: ['900', '901', '902'] }),
        TimestampMs: Date.now(),
        Sid: 'EV123',
      };

      // @ts-ignore
      const events = workerActivityUpdateHandler(input);
      expect(events).not.toBeFalsy();
      expect(events).toBeInstanceOf(Array);
      expect(events.length).toBe(3);

      const [event] = events;

      assertEvent(input, event, 'actor.logged-in');
    });
  });

  describe('Activity offline -> *', (): void => {
    test("Shouldn't convert worker.activity.update (offline -> offline) to any event", (): void => {
      const input = {
        EventType: 'worker.activity.update',
        WorkerName: 'test',
        WorkerSid: 'WW123',
        WorkerActivityName: 'offline',
        WorkerPreviousActivityName: 'offline',
        WorkerAttributes: JSON.stringify(workerAttr),
        TimestampMs: Date.now(),
        Sid: 'EV123',
      };

      // @ts-ignore
      const events = workerActivityUpdateHandler(input);
      expect(events).not.toBeFalsy();
      expect(events).toBeInstanceOf(Array);
      expect(events.length).toBe(0);
    });

    test("Shouldn't convert worker.activity.update (offline -> unavaliable) to any event", (): void => {
      const input = {
        EventType: 'worker.activity.update',
        WorkerName: 'test',
        WorkerSid: 'WW123',
        WorkerActivityName: 'Unavaliable',
        WorkerPreviousActivityName: 'Offline',
        WorkerAttributes: JSON.stringify(workerAttr),
        TimestampMs: Date.now(),
        Sid: 'EV123',
      };

      // @ts-ignore
      const events = workerActivityUpdateHandler(input);
      expect(events).not.toBeFalsy();
      expect(events).toBeInstanceOf(Array);
      expect(events.length).toBe(0);
    });

    test('Should convert worker.activity.update (offline -> available) to actor.logged-in', (): void => {
      const input = {
        EventType: 'worker.activity.update',
        WorkerName: 'test',
        WorkerSid: 'WW123',
        WorkerActivityName: 'Available',
        WorkerPreviousActivityName: 'Offline',
        WorkerAttributes: JSON.stringify(workerAttr),
        TimestampMs: Date.now(),
        Sid: 'EV123',
      };

      // @ts-ignore
      const events = workerActivityUpdateHandler(input);
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
        WorkerActivityName: 'Break',
        WorkerPreviousActivityName: 'Offline',
        WorkerAttributes: JSON.stringify(workerAttr),
        TimestampMs: Date.now(),
        Sid: 'EV123',
      };

      // @ts-ignore
      const events = workerActivityUpdateHandler(input);
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
        WorkerActivityName: 'Unavailable',
        WorkerPreviousActivityName: 'Unavailable',
        WorkerAttributes: JSON.stringify(workerAttr),
        TimestampMs: Date.now(),
        Sid: 'EV123',
      };

      // @ts-ignore
      const events = workerActivityUpdateHandler(input);
      expect(events).not.toBeFalsy();
      expect(events).toBeInstanceOf(Array);
      expect(events.length).toBe(0);
    });

    test("Shouldn't convert worker.activity.update (unavailable -> offline) to any event", (): void => {
      const input = {
        EventType: 'worker.activity.update',
        WorkerName: 'test',
        WorkerSid: 'WW123',
        WorkerActivityName: 'Offline',
        WorkerPreviousActivityName: 'Unavailable',
        WorkerAttributes: JSON.stringify(workerAttr),
        TimestampMs: Date.now(),
      };

      // @ts-ignore
      const events = workerActivityUpdateHandler(input);
      expect(events).not.toBeFalsy();
      expect(events).toBeInstanceOf(Array);
      expect(events.length).toBe(0);
    });

    test('Should convert worker.activity.update (unavailable -> available) to actor.logged-in', (): void => {
      const input = {
        EventType: 'worker.activity.update',
        WorkerName: 'test',
        WorkerSid: 'WW123',
        WorkerActivityName: 'Available',
        WorkerPreviousActivityName: 'Unavailable',
        WorkerAttributes: JSON.stringify(workerAttr),
        TimestampMs: Date.now(),
        Sid: 'EV123',
      };

      // @ts-ignore
      const events = workerActivityUpdateHandler(input);
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
        WorkerActivityName: 'Break',
        WorkerPreviousActivityName: 'Unavailable',
        WorkerAttributes: JSON.stringify(workerAttr),
        TimestampMs: Date.now(),
        Sid: 'EV123',
      };

      // @ts-ignore
      const events = workerActivityUpdateHandler(input);
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
        WorkerActivityName: 'Available',
        WorkerPreviousActivityName: 'Available',
        WorkerAttributes: JSON.stringify(workerAttr),
        TimestampMs: Date.now(),
        Sid: 'EV123',
      };

      // @ts-ignore
      const events = workerActivityUpdateHandler(input);
      expect(events).not.toBeFalsy();
      expect(events).toBeInstanceOf(Array);
      expect(events.length).toBe(0);
    });

    test('Should convert worker.activity.update (available -> offline) to actor.logged-out', (): void => {
      const input = {
        EventType: 'worker.activity.update',
        WorkerName: 'test',
        WorkerSid: 'WW123',
        WorkerActivityName: 'Offline',
        WorkerPreviousActivityName: 'Available',
        WorkerAttributes: JSON.stringify(workerAttr),
        TimestampMs: Date.now(),
        Sid: 'EV123',
      };

      // @ts-ignore
      const events = workerActivityUpdateHandler(input);
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
        WorkerActivityName: 'Unavailable',
        WorkerPreviousActivityName: 'Available',
        WorkerAttributes: JSON.stringify(workerAttr),
        TimestampMs: Date.now(),
        Sid: 'EV123',
      };

      // @ts-ignore
      const events = workerActivityUpdateHandler(input);
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
        WorkerActivityName: 'Break',
        WorkerPreviousActivityName: 'Available',
        WorkerAttributes: JSON.stringify(workerAttr),
        TimestampMs: Date.now(),
        Sid: 'EV123',
      };

      // @ts-ignore
      const events = workerActivityUpdateHandler(input);
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
        WorkerActivityName: 'Break',
        WorkerPreviousActivityName: 'Break',
        WorkerAttributes: JSON.stringify(workerAttr),
        TimestampMs: Date.now(),
        Sid: 'EV123',
      };

      // @ts-ignore
      const events = workerActivityUpdateHandler(input);
      expect(events).not.toBeFalsy();
      expect(events).toBeInstanceOf(Array);
      expect(events.length).toBe(0);
    });

    test('Should convert worker.activity.update (break -> available) to actor.unpaused', (): void => {
      const input = {
        EventType: 'worker.activity.update',
        WorkerName: 'test',
        WorkerSid: 'WW123',
        WorkerActivityName: 'Available',
        WorkerPreviousActivityName: 'Break',
        WorkerAttributes: JSON.stringify(workerAttr),
        TimestampMs: Date.now(),
        Sid: 'EV123',
      };

      // @ts-ignore
      const events = workerActivityUpdateHandler(input);
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
        WorkerActivityName: 'Unavailable',
        WorkerPreviousActivityName: 'Break',
        WorkerAttributes: JSON.stringify(workerAttr),
        TimestampMs: Date.now(),
        Sid: 'EV123',
      };

      // @ts-ignore
      const events = workerActivityUpdateHandler(input);
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
        WorkerActivityName: 'Offline',
        WorkerPreviousActivityName: 'Break',
        WorkerAttributes: JSON.stringify(workerAttr),
        TimestampMs: Date.now(),
        Sid: 'EV123',
      };

      // @ts-ignore
      const events = workerActivityUpdateHandler(input);
      expect(events).not.toBeFalsy();
      expect(events).toBeInstanceOf(Array);
      expect(events.length).toBe(1);

      const [event] = events;

      assertEvent(input, event, 'actor.logged-out');
    });
  });

  test('Should throw an error if the event passed to the handler is different from worker.activity.update', (): void => {
    const invalidInput = {
      EventType: 'worker.create',
      WorkerName: 'test',
      WorkerSid: 'WW123',
      WorkerActivityName: 'Offline',
      WorkerPreviousActivityName: 'Break',
      WorkerAttributes: JSON.stringify(workerAttr),
      TimestampMs: Date.now(),
      Sid: 'EV123',
    };

    expect(() => {
      // @ts-ignore
      workerActivityUpdateHandler(invalidInput);
    }).toThrow();
  });

  test('Should throw an error if the event passed to the handler has no WorkerAttributes', (): void => {
    const invalidInput = {
      EventType: 'worker.activity.update',
      WorkerName: 'test',
      WorkerSid: 'WW123',
      WorkerActivityName: 'Offline',
      WorkerPreviousActivityName: 'Break',
      TimestampMs: Date.now(),
      Sid: 'EV123',
    };

    expect(() => {
      workerActivityUpdateHandler(invalidInput as any);
    }).toThrow();
  });

  test('Should throw an error if the event passed to the handler has no WorkerActivityName', (): void => {
    const invalidInput = {
      EventType: 'worker.activity.update',
      WorkerName: 'test',
      WorkerSid: 'WW123',
      WorkerPreviousActivityName: 'Break',
      WorkerAttributes: JSON.stringify(workerAttr),
      TimestampMs: Date.now(),
      Sid: 'EV123',
    };

    expect(() => {
      workerActivityUpdateHandler(invalidInput as any);
    }).toThrow();
  });
});

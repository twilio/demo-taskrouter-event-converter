import { taskRouterEventConverter } from './index';

describe('Misc', () => {
  test('Should return an empty array if an unhandled event is passed in', () => {
    const events = taskRouterEventConverter({
      // @ts-ignore
      EventType: 'not.handled',
    });

    expect(events).not.toBeFalsy();
    expect(events).toBeInstanceOf(Array);
    expect(events.length).toBe(0);
  });

  test('Should return an empty array if EventType is not provided', () => {
    // @ts-ignore
    const events = taskRouterEventConverter({});

    expect(events).not.toBeFalsy();
    expect(events).toBeInstanceOf(Array);
    expect(events.length).toBe(0);
  });
});

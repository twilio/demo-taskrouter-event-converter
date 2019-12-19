import { isTaskEvent } from './index';

describe('Test isTaskEvent', () => {
  test('Should return true if the EventType starts with `task.`', () => {
    const event = {
      EventType: 'task.created',
    };

    expect(isTaskEvent(event as any)).toBe(true);
  });

  test("Should return false if the EventType doesn't start with `task.`", () => {
    const event = {
      EventType: 'reservation.created',
    };

    expect(isTaskEvent(event as any)).toBe(false);
  });
});

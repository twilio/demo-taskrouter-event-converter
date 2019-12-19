import { taskFilterMiddleware } from './task-filter';

describe('Test TaskFilterMiddleware', () => {
  test("Shouldn't call next if the event is related to a task that isn't a call", () => {
    const req = {
      body: {
        EventType: 'task.created',
        // Since there isn't a call_id in the task attributes, it's not a task related to a call.
        TaskAttributes: JSON.stringify({
          attr: 'Random attribute',
        }),
      },
    };

    const res = {
      status: jest.fn().mockReturnValueOnce({
        json: jest.fn(),
      }),
    };


    const next = jest.fn();
    taskFilterMiddleware(req as any, res as any, next);

    expect(next).not.toBeCalled();
  });

  test('Should call next if the event is related to a task and the call_id property exists', () => {
    const req = {
      body: {
        EventType: 'task.created',
        // Since there isn't a call_id in the task attributes, it's not a task related to a call.
        TaskAttributes: JSON.stringify({
          attr: 'Random attribute',
          call_id: 'CA123',
        }),
      },
    };

    const res = {
      status: jest.fn().mockReturnValueOnce({
        json: jest.fn(),
      }),
    };


    const next = jest.fn();
    taskFilterMiddleware(req as any, res as any, next);

    expect(next).toBeCalled();
  });

  /* In order to prevent errors on filtering, events that doesn't have a call_id but isn't related
   * to a task will be allowed by this filter */
  test("Should call next if the event doesn't have a call id but it's not related to a task", () => {
    const req = {
      body: {
        EventType: 'actor.paused',
        TaskAttributes: JSON.stringify({
          attr: 'Random attribute',
        }),
      },
    };

    const res = {
      status: jest.fn().mockReturnValueOnce({
        json: jest.fn(),
      }),
    };


    const next = jest.fn();
    taskFilterMiddleware(req as any, res as any, next);

    expect(next).toBeCalled();
  });
});

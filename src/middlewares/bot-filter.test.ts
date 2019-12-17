import { botFilterMiddleware } from './bot-filter';

describe('Test BotFilterMiddleware', () => {
  test("Shouldn't call next if the event is related to a bot worker", () => {
    const req = {
      body: {
        WorkerAttributes: JSON.stringify({
          bot: true,
          name: 'dialer',
        }),
      },
    };

    const res = {
      status: jest.fn().mockReturnValueOnce({
        json: jest.fn(),
      }),
    };


    const next = jest.fn();
    botFilterMiddleware(req as any, res as any, next);

    expect(next).not.toBeCalled();
  });

  test("Should call next if the event isn't related to a bot worker", () => {
    const req = {
      body: {
        WorkerAttributes: JSON.stringify({
          name: 'lfrezarini',
        }),
      },
    };

    const res = {
      status: jest.fn().mockReturnValueOnce({
        json: jest.fn(),
      }),
    };


    const next = jest.fn();
    botFilterMiddleware(req as any, res as any, next);

    expect(next).toBeCalled();
  });
});

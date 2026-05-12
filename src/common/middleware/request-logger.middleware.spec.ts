import { RequestLoggerMiddleware } from './request-logger.middleware';

describe('RequestLoggerMiddleware', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('logs request duration after response finishes', () => {
    const middleware = new RequestLoggerMiddleware();
    const next = jest.fn();
    const handlers: Record<string, () => void> = {};
    const logSpy = jest.spyOn(console, 'log').mockImplementation();

    middleware.use(
      { method: 'GET', originalUrl: '/hospitals' } as never,
      {
        statusCode: 200,
        on: (event: string, handler: () => void) => {
          handlers[event] = handler;
          return {} as never;
        },
      } as never,
      next,
    );

    expect(next).toHaveBeenCalled();
    handlers.finish();
    expect(logSpy).toHaveBeenCalledWith(
      expect.stringContaining('[GET] /hospitals 200 - '),
    );
  });
});

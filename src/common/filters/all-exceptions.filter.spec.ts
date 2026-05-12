import { BadRequestException } from '@nestjs/common';
import { AllExceptionsFilter } from './all-exceptions.filter';

function createHost(url = '/test') {
  const status = jest.fn().mockReturnThis();
  const json = jest.fn();

  return {
    host: {
      switchToHttp: () => ({
        getResponse: () => ({ status, json }),
        getRequest: () => ({ url }),
      }),
    } as never,
    status,
    json,
  };
}

describe('AllExceptionsFilter', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('formats HttpException payloads', () => {
    const filter = new AllExceptionsFilter();
    const { host, status, json } = createHost('/auth/login');

    filter.catch(new BadRequestException('Invalid input'), host);

    expect(status).toHaveBeenCalledWith(400);
    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 400,
        message: 'Invalid input',
        path: '/auth/login',
      }),
    );
  });

  it('joins array messages from HttpException object payloads', () => {
    const filter = new AllExceptionsFilter();
    const { host, json } = createHost('/bookings');

    filter.catch(new BadRequestException(['doctor required', 'room required']), host);

    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'doctor required, room required',
      }),
    );
  });

  it('falls back to internal server error for unknown exceptions', () => {
    const filter = new AllExceptionsFilter();
    const { host, status, json } = createHost('/rooms');
    const errorSpy = jest.spyOn(console, 'error').mockImplementation();

    filter.catch(new Error('boom'), host);

    expect(errorSpy).toHaveBeenCalled();
    expect(status).toHaveBeenCalledWith(500);
    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 500,
        message: 'Internal server error',
        path: '/rooms',
      }),
    );
  });
});

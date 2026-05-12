import { BadRequestException } from '@nestjs/common';
import { HttpExceptionFilter } from './http-exception.filter';

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

describe('HttpExceptionFilter', () => {
  it('formats error payload from string response', () => {
    const filter = new HttpExceptionFilter();
    const exception = new BadRequestException('Invalid payload');
    const { host, status, json } = createHost('/bookings');

    filter.catch(exception, host);

    expect(status).toHaveBeenCalledWith(400);
    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 400,
        message: 'Invalid payload',
        path: '/bookings',
      }),
    );
  });

  it('joins message arrays from object payloads', () => {
    const filter = new HttpExceptionFilter();
    const exception = new BadRequestException(['field a invalid', 'field b invalid']);
    const { host, status, json } = createHost('/auth/register');

    filter.catch(exception, host);

    expect(status).toHaveBeenCalledWith(400);
    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'field a invalid, field b invalid',
      }),
    );
  });
});

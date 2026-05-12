import { UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from './auth.guard';

describe('AuthGuard', () => {
  const authService = {
    resolveUserByToken: jest.fn(),
  };
  const guard = new AuthGuard(authService as never);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  function makeContext(headers: Record<string, string | undefined>) {
    const request = { headers } as {
      headers: { authorization?: string };
      user?: unknown;
    };

    return {
      context: {
        switchToHttp: () => ({
          getRequest: () => request,
        }),
      } as never,
      request,
    };
  }

  it('attaches resolved user for valid bearer token', async () => {
    authService.resolveUserByToken.mockResolvedValue({ id: 'u1' });
    const { context, request } = makeContext({
      authorization: 'Bearer token-123',
    });

    await expect(guard.canActivate(context)).resolves.toBe(true);
    expect(authService.resolveUserByToken).toHaveBeenCalledWith('token-123');
    expect(request.user).toEqual({ id: 'u1' });
  });

  it('throws when bearer header is missing', async () => {
    const { context } = makeContext({});

    await expect(guard.canActivate(context)).rejects.toThrow(
      UnauthorizedException,
    );
  });
});

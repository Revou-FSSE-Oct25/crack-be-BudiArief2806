import { AuthController } from './auth.controller';

describe('AuthController', () => {
  const authService = {
    register: jest.fn(),
    login: jest.fn(),
  };
  const controller = new AuthController(authService as never);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('delegates register to AuthService', async () => {
    authService.register.mockResolvedValue({ user: { id: 'u1' } });

    await expect(
      controller.register({
        name: 'Rina',
        email: 'rina@example.com',
        password: 'secret123',
      }),
    ).resolves.toEqual({ user: { id: 'u1' } });
  });

  it('delegates login to AuthService', async () => {
    authService.login.mockResolvedValue({ accessToken: 'jwt' });

    await expect(
      controller.login({
        email: 'admin@example.com',
        password: 'secret123',
      }),
    ).resolves.toEqual({ accessToken: 'jwt' });
  });

  it('returns current user from me()', () => {
    const user = { id: 'u1', name: 'Admin', email: 'admin@example.com' };
    expect(controller.me(user as never)).toEqual({ user });
  });
});

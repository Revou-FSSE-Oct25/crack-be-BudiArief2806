import { UnauthorizedException } from '@nestjs/common';
import { Role } from '../../common/enums/domain.enums';
import * as passwordUtil from '../../common/security/password.util';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  const usersService = {
    createUser: jest.fn(),
    findEntityByEmail: jest.fn(),
    findEntityById: jest.fn(),
    toPublicUser: jest.fn(),
  };
  const jwtService = {
    signAsync: jest.fn(),
    verifyAsync: jest.fn(),
  };

  let service: AuthService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new AuthService(usersService as never, jwtService as never);
  });

  it('registers user with USER role', async () => {
    usersService.createUser.mockResolvedValue({ id: 'u1' });

    await expect(
      service.register({
        name: 'Rina',
        email: 'rina@example.com',
        password: 'secret123',
      }),
    ).resolves.toEqual({ user: { id: 'u1' } });

    expect(usersService.createUser).toHaveBeenCalledWith(
      expect.objectContaining({
        role: Role.USER,
      }),
    );
  });

  it('logs in and returns JWT payload', async () => {
    const entity = {
      id: 'u1',
      email: 'admin@example.com',
      password: 'hashed',
      role: Role.ADMIN,
    };
    const publicUser = {
      id: 'u1',
      name: 'Admin',
      email: 'admin@example.com',
      role: Role.ADMIN,
    };

    usersService.findEntityByEmail.mockResolvedValue(entity);
    usersService.toPublicUser.mockReturnValue(publicUser);
    jest.spyOn(passwordUtil, 'verifyPassword').mockResolvedValue(true);
    jwtService.signAsync.mockResolvedValue('jwt-token');

    await expect(
      service.login({
        email: 'Admin@Example.com',
        password: 'secret123',
      }),
    ).resolves.toEqual({
      accessToken: 'jwt-token',
      tokenType: 'Bearer',
      role: Role.ADMIN,
      user: publicUser,
    });
  });

  it('throws when credentials are invalid', async () => {
    usersService.findEntityByEmail.mockResolvedValue(null);

    await expect(
      service.login({
        email: 'missing@example.com',
        password: 'secret123',
      }),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('resolves current user from token', async () => {
    const publicUser = {
      id: 'u2',
      name: 'Doctor',
      email: 'doctor@example.com',
      role: Role.DOCTOR,
      doctorId: 'd2',
    };

    jwtService.verifyAsync.mockResolvedValue({
      sub: 'u2',
      email: 'doctor@example.com',
      role: Role.DOCTOR,
    });
    usersService.findEntityById.mockResolvedValue({ id: 'u2' });
    usersService.toPublicUser.mockReturnValue(publicUser);

    await expect(service.resolveUserByToken('token')).resolves.toEqual(
      publicUser,
    );
  });

  it('throws when token verification fails', async () => {
    jwtService.verifyAsync.mockRejectedValue(new Error('bad token'));

    await expect(service.resolveUserByToken('token')).rejects.toThrow(
      UnauthorizedException,
    );
  });
});

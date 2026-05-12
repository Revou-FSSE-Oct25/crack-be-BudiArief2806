// Service auth.
// Di sinilah alur register, login, dan pembacaan user dari token diproses.
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Role } from '../../common/enums/domain.enums';
import { verifyPassword } from '../../common/security/password.util';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const user = await this.usersService.createUser({
      name: dto.name,
      email: dto.email,
      password: dto.password,
      role: Role.USER,
    });

    return { user };
  }

  async login(dto: LoginDto) {
    const user = await this.usersService.findEntityByEmail(
      dto.email.trim().toLowerCase(),
    );

    if (!user || !(await verifyPassword(dto.password, user.password))) {
      throw new UnauthorizedException('Email or password is invalid');
    }

    const publicUser = this.usersService.toPublicUser(user);
    const accessToken = await this.jwtService.signAsync({
      sub: publicUser.id,
      email: publicUser.email,
      role: publicUser.role,
    });

    return {
      accessToken,
      tokenType: 'Bearer',
      role: publicUser.role,
      user: publicUser,
    };
  }

  async resolveUserByToken(token: string) {
    try {
      const payload = await this.jwtService.verifyAsync<{
        sub?: string;
        email?: string;
        role?: Role;
      }>(token);

      if (!payload.sub) {
        throw new UnauthorizedException('Invalid token payload');
      }

      const user = await this.usersService.findEntityById(payload.sub);
      return this.usersService.toPublicUser(user);
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}

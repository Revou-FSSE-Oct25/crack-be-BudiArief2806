import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { randomBytes } from 'crypto';
import { Role } from '../../common/enums/domain.enums';
import { verifyPassword } from '../../common/security/password.util';
import { UsersService } from '../users/users.service';
import type { PublicUser } from '../users/entities/user.entity';
import { GoogleLoginDto } from './dto/google-login.dto';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

type GoogleTokenInfo = {
  aud?: string;
  azp?: string;
  email?: string;
  email_verified?: string;
  name?: string;
  picture?: string;
  sub?: string;
};

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const verificationToken = randomBytes(32).toString('hex');
    const verificationExpiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24);

    const user = await this.usersService.createUser({
      ...dto,
      role: Role.USER,
      emailVerified: false,
      emailVerificationToken: verificationToken,
      emailVerificationExpiresAt: verificationExpiresAt,
    });

    return {
      user,
      requiresEmailVerification: true,
      verificationUrl: this.buildVerificationUrl(verificationToken),
    };
  }

  async verifyEmail(token: string) {
    if (!token) {
      throw new BadRequestException('Verification token is required');
    }

    const user = await this.usersService.findEntityByVerificationToken(token);
    if (!user) {
      throw new BadRequestException('Verification token is invalid or expired');
    }

    if (user.emailVerified) {
      return {
        verified: true,
        user: this.usersService.toPublicUser(user),
      };
    }

    if (!user.emailVerificationExpiresAt || user.emailVerificationExpiresAt.getTime() < Date.now()) {
      throw new BadRequestException('Verification token is invalid or expired');
    }

    const verifiedUser = await this.usersService.verifyEmail(user.id);

    return {
      verified: true,
      user: verifiedUser,
    };
  }

  async login(dto: LoginDto) {
    const user = await this.usersService.findEntityByEmail(dto.email);

    if (!user || !(await verifyPassword(dto.password, user.password))) {
      throw new UnauthorizedException('Email or password is incorrect');
    }

    if (!user.emailVerified) {
      throw new UnauthorizedException('Please verify your email before signing in');
    }

    return this.issueAuthResponse(this.usersService.toPublicUser(user));
  }

  async googleLogin(dto: GoogleLoginDto) {
    const profile = await this.verifyGoogleIdToken(dto.idToken);

    const email = profile.email?.trim().toLowerCase();
    const googleId = profile.sub?.trim();

    if (!email || !googleId) {
      throw new UnauthorizedException('Google account data is incomplete');
    }

    const existingGoogleUser = await this.usersService.findEntityByGoogleId(googleId);
    if (existingGoogleUser) {
      return this.issueAuthResponse(this.usersService.toPublicUser(existingGoogleUser));
    }

    const existingEmailUser = await this.usersService.findEntityByEmail(email);
    if (existingEmailUser) {
      const linkedUser = await this.usersService.updateGoogleIdentity(existingEmailUser.id, {
        googleId,
        emailVerified: true,
      });

      return this.issueAuthResponse(linkedUser);
    }

    const generatedPassword = randomBytes(24).toString('hex');
    const newUser = await this.usersService.createUser({
      name: profile.name?.trim() || email.split('@')[0],
      email,
      password: generatedPassword,
      role: Role.USER,
      emailVerified: true,
      googleId,
    });

    return this.issueAuthResponse(newUser);
  }

  async resolveUserByToken(token: string): Promise<PublicUser> {
    try {
      const payload = await this.jwtService.verifyAsync<{ sub: string }>(token);
      const user = await this.usersService.findEntityById(payload.sub);

      if (!user) {
        throw new UnauthorizedException('User associated with this token no longer exists');
      }

      return this.usersService.toPublicUser(user);
    } catch {
      throw new UnauthorizedException('Token is invalid or expired');
    }
  }

  private async issueAuthResponse(user: PublicUser) {
    const accessToken = await this.jwtService.signAsync({
      sub: user.id,
      role: user.role,
      email: user.email,
    });

    return {
      accessToken,
      tokenType: 'Bearer' as const,
      role: user.role,
      user,
    };
  }

  private buildVerificationUrl(token: string) {
    const frontendOrigin = this.resolveFrontendOrigin();
    return `${frontendOrigin.replace(/\/$/, '')}/verify-email?token=${token}`;
  }

  private resolveFrontendOrigin() {
    const envOrigins = (process.env.FRONTEND_URL ?? '')
      .split(',')
      .map((value) => value.trim())
      .filter(Boolean);

    return envOrigins[0] ?? 'http://localhost:3000';
  }

  private async verifyGoogleIdToken(idToken: string) {
    const response = await fetch(
      `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(idToken)}`,
    );

    if (!response.ok) {
      throw new UnauthorizedException('Google token is invalid');
    }

    const profile = (await response.json()) as GoogleTokenInfo;

    if (profile.email_verified !== 'true') {
      throw new UnauthorizedException('Google email is not verified');
    }

    const expectedClientId = process.env.GOOGLE_CLIENT_ID?.trim();
    const tokenAudiences = [profile.aud, profile.azp]
      .map((value) => value?.trim())
      .filter((value): value is string => Boolean(value));

    if (expectedClientId && !tokenAudiences.includes(expectedClientId)) {
      throw new UnauthorizedException('Google token audience is invalid');
    }

    return profile;
  }
}

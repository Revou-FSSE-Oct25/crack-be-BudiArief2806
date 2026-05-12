// Guard auth.
// Guard ini membaca bearer token lalu menempelkan user aktif ke request.
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from '../auth.service';
import { PublicUser } from '../../users/entities/user.entity';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context
      .switchToHttp()
      .getRequest<{ headers: { authorization?: string }; user?: PublicUser }>();
    const header = request.headers.authorization;

    // Hanya header dengan format "Bearer <token>" yang diterima.
    if (!header || !header.startsWith('Bearer ')) {
      throw new UnauthorizedException('Bearer token is required');
    }

    // Ambil token bersih lalu resolve ke user aktif.
    const token = header.slice('Bearer '.length).trim();
    request.user = await this.authService.resolveUserByToken(token);

    return true;
  }
}

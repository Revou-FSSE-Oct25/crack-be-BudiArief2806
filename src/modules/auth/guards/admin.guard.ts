// Guard admin.
// Guard ini memastikan endpoint tertentu hanya bisa dipakai role admin.
import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Role } from '../../../common/enums/domain.enums';
import { PublicUser } from '../../users/entities/user.entity';

@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context
      .switchToHttp()
      .getRequest<{ user?: PublicUser }>();

    // AdminGuard mengasumsikan user sudah ditempelkan lebih dulu oleh AuthGuard.
    if (request.user?.role !== Role.ADMIN) {
      throw new ForbiddenException('Admin access is required');
    }

    return true;
  }
}

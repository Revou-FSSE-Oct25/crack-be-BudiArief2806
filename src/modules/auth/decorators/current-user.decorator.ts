// Decorator helper untuk mengambil user aktif dari request yang sudah lolos AuthGuard.
// Dengan decorator ini, controller tidak perlu menulis request.user secara manual.
import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { PublicUser } from '../../users/entities/user.entity';

export const CurrentUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext): PublicUser | undefined => {
    const request = context
      .switchToHttp()
      .getRequest<{ user?: PublicUser }>();

    // AuthGuard menempelkan user ke request.
    // Decorator ini hanya membaca nilai tersebut dan mengembalikannya.
    return request.user;
  },
);

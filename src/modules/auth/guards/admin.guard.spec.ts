import { ForbiddenException } from '@nestjs/common';
import { Role } from '../../../common/enums/domain.enums';
import { AdminGuard } from './admin.guard';

describe('AdminGuard', () => {
  const guard = new AdminGuard();

  function makeContext(role?: Role) {
    return {
      switchToHttp: () => ({
        getRequest: () => ({
          user: role ? { role } : undefined,
        }),
      }),
    } as never;
  }

  it('allows admin users', () => {
    expect(guard.canActivate(makeContext(Role.ADMIN))).toBe(true);
  });

  it('rejects non-admin users', () => {
    expect(() => guard.canActivate(makeContext(Role.USER))).toThrow(
      ForbiddenException,
    );
  });
});

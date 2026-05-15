import { Role } from '../../../common/enums/domain.enums';

export class UserEntity {
  id!: string;

  name!: string;

  email!: string;

  password!: string;

  role!: Role;

  emailVerified!: boolean;

  emailVerificationToken?: string | null;

  emailVerificationExpiresAt?: Date | null;

  googleId?: string | null;

  doctorId?: string;

  createdAt!: Date | string;
  updatedAt!: Date | string;
}

export type PublicUser = Omit<UserEntity, 'password'>;

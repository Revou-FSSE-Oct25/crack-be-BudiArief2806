import { Role } from '../../../common/enums/domain.enums';

export class UserEntity {
  id!: string;

  name!: string;

  email!: string;

  password!: string;

  role!: Role;

  doctorId?: string;

  createdAt!: Date | string;
  updatedAt!: Date | string;
}

export type PublicUser = Omit<UserEntity, 'password'>;

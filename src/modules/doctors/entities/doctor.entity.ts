import { Specialty } from '../../../common/enums/domain.enums';

export class DoctorEntity {
  id!: string;

  hospitalId!: string;

  name!: string;

  specialty!: Specialty;

  available!: boolean;

  hospitalName!: string;

  createdAt!: Date | string;
  updatedAt!: Date | string;
}

export type DoctorView = DoctorEntity;

import { RoomType } from '../../../common/enums/domain.enums';

export class RoomEntity {
  id!: string;

  hospitalId!: string;

  // doctorId bersifat opsional karena endpoint room sekarang bisa
  // mengembalikan availability umum atau availability spesifik dokter.
  doctorId?: string;

  name!: string;

  type!: RoomType;

  available!: boolean;

  createdAt!: Date | string;
  updatedAt!: Date | string;
}

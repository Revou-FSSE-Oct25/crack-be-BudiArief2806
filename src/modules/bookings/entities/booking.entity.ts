import {
  BookingStatus,
  DiseaseStage,
  RoomType,
  Specialty,
} from '../../../common/enums/domain.enums';

export class PrescriptionEntity {
  stage!: DiseaseStage;

  items!: string[];

  notes!: string;

  createdAt!: string;

  createdBy!: 'admin' | 'doctor';
}

export class DoctorReviewEntity {
  symptoms!: string;

  diagnosis!: string;

  estimatedCost!: number;

  healthAdvice!: string;

  createdAt!: string;
  updatedAt!: string;

  createdBy!: 'doctor';
}

export class BookingEntity {
  id!: string;

  userId?: string | null;
  patientName!: string;
  patientAge?: number | null;
  userName?: string;
  userEmail?: string;

  hospitalId!: string;
  hospitalName?: string;

  doctorId!: string;
  doctorName?: string;
  specialty?: Specialty;

  roomId!: string;
  roomName?: string;
  roomType?: RoomType;

  complaint!: string;

  status!: BookingStatus;

  createdAt!: Date | string;
  updatedAt!: Date | string;

  queueNumber!: number;
  etaMinutes!: number;

  prescription?: PrescriptionEntity;
  doctorReview?: DoctorReviewEntity;

  user?: {
    id: string;
    name: string;
    email: string;
  };

  doctor?: {
    id: string;
    name: string;
    specialty: Specialty;
    hospitalId: string;
  };

  hospital?: {
    id: string;
    name: string;
  };

  room?: {
    id: string;
    name: string;
    type: RoomType;
    available: boolean;
  };
}

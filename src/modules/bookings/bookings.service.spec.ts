import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { BookingStatus, Role } from '../../common/enums/domain.enums';
import { BookingsService } from './bookings.service';

function makeBooking(overrides: Record<string, unknown> = {}) {
  return {
    id: 'b1',
    userId: 'u1',
    patientName: 'Rina Diabstrok',
    patientAge: 46,
    hospitalId: 'thb',
    doctorId: 'd2',
    roomId: 'r1',
    complaint: 'Kontrol rutin diabetes',
    status: BookingStatus.PENDING,
    queueNumber: 1,
    etaMinutes: 12,
    createdAt: new Date('2026-05-09T00:00:00.000Z'),
    updatedAt: new Date('2026-05-09T00:00:00.000Z'),
    user: {
      id: 'u1',
      name: 'Rina Diabstrok',
      email: 'rina@example.com',
    },
    doctor: {
      id: 'd2',
      name: 'dr. Siti Rahma',
      specialty: 'Diabetes',
      hospitalId: 'thb',
    },
    hospital: {
      id: 'thb',
      name: 'RS Taman Harapan Baru',
    },
    room: {
      id: 'r1',
      name: 'VIP 01',
      type: 'VIP',
      available: true,
    },
    ...overrides,
  };
}

describe('BookingsService', () => {
  const bookingsRepository = {
    countActiveByHospitalId: jest.fn(),
    create: jest.fn(),
    findAllByUserId: jest.fn(),
    findAll: jest.fn(),
    findAllByDoctorId: jest.fn(),
    findById: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    upsertPrescription: jest.fn(),
    upsertDoctorReview: jest.fn(),
  };
  const hospitalsService = {
    findById: jest.fn(),
  };
  const doctorsService = {
    findById: jest.fn(),
  };
  const roomsService = {
    findByDoctorAndRoomId: jest.fn(),
  };

  let service: BookingsService;

  const patientUser = {
    id: 'u1',
    name: 'Rina Diabstrok',
    email: 'rina@example.com',
    role: Role.USER,
  };
  const adminUser = {
    id: 'u-admin',
    name: 'Admin',
    email: 'admin@example.com',
    role: Role.ADMIN,
  };
  const doctorUser = {
    id: 'u-doc',
    name: 'Doctor',
    email: 'doctor@example.com',
    role: Role.DOCTOR,
    doctorId: 'd2',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    service = new BookingsService(
      bookingsRepository as never,
      hospitalsService as never,
      doctorsService as never,
      roomsService as never,
    );

    hospitalsService.findById.mockResolvedValue({
      id: 'thb',
      name: 'RS Taman Harapan Baru',
    });
    doctorsService.findById.mockResolvedValue({
      id: 'd2',
      hospitalId: 'thb',
      name: 'dr. Siti Rahma',
      specialty: 'Diabetes',
      available: true,
    });
    roomsService.findByDoctorAndRoomId.mockResolvedValue({
      id: 'r1',
      hospitalId: 'thb',
      name: 'VIP 01',
      type: 'VIP',
      available: true,
    });
    bookingsRepository.countActiveByHospitalId.mockResolvedValue(0);
    bookingsRepository.create.mockResolvedValue(makeBooking());
    bookingsRepository.findById.mockResolvedValue(makeBooking());
    bookingsRepository.update.mockResolvedValue(
      makeBooking({ status: BookingStatus.CONFIRMED }),
    );
    bookingsRepository.findAll.mockResolvedValue([makeBooking()]);
    bookingsRepository.findAllByDoctorId.mockResolvedValue([
      makeBooking({ doctorId: 'd2' }),
    ]);
    bookingsRepository.findAllByUserId.mockResolvedValue([
      makeBooking({ userId: 'u1' }),
    ]);
    bookingsRepository.upsertPrescription.mockResolvedValue(makeBooking());
    bookingsRepository.upsertDoctorReview.mockResolvedValue(
      makeBooking({ status: BookingStatus.REVIEWED_BY_DOCTOR }),
    );
  });

  it('creates booking for normal user', async () => {
    const result = await service.create(patientUser as never, {
      hospitalId: 'thb',
      doctorId: 'd2',
      roomId: 'r1',
      complaint: '  Kontrol rutin diabetes  ',
    });

    expect(bookingsRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 'u1',
        patientName: 'Rina Diabstrok',
        complaint: 'Kontrol rutin diabetes',
        status: BookingStatus.PENDING,
      }),
    );
    expect(result.item.userName).toBe('Rina Diabstrok');
  });

  it('creates admin walk-in booking with patient data', async () => {
    await service.create(adminUser as never, {
      hospitalId: 'thb',
      doctorId: 'd2',
      roomId: 'r1',
      complaint: 'Pasien datang langsung',
      patientName: 'Budi Santoso',
      patientAge: 54,
    });

    expect(bookingsRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: null,
        patientName: 'Budi Santoso',
        patientAge: 54,
      }),
    );
  });

  it('rejects admin walk-in booking without patient name', async () => {
    await expect(
      service.create(adminUser as never, {
        hospitalId: 'thb',
        doctorId: 'd2',
        roomId: 'r1',
        complaint: 'Pasien datang langsung',
        patientAge: 54,
      }),
    ).rejects.toThrow(BadRequestException);
  });

  it('rejects booking when doctor belongs to another hospital', async () => {
    doctorsService.findById.mockResolvedValue({
      id: 'd2',
      hospitalId: 'primaya-lu',
      available: true,
    });

    await expect(
      service.create(patientUser as never, {
        hospitalId: 'thb',
        doctorId: 'd2',
        roomId: 'r1',
        complaint: 'Kontrol rutin diabetes',
      }),
    ).rejects.toThrow(ForbiddenException);
  });

  it('rejects booking when doctor or room is unavailable', async () => {
    doctorsService.findById.mockResolvedValue({
      id: 'd2',
      hospitalId: 'thb',
      available: false,
    });

    await expect(
      service.create(patientUser as never, {
        hospitalId: 'thb',
        doctorId: 'd2',
        roomId: 'r1',
        complaint: 'Kontrol rutin diabetes',
      }),
    ).rejects.toThrow(ForbiddenException);

    doctorsService.findById.mockResolvedValue({
      id: 'd2',
      hospitalId: 'thb',
      available: true,
    });
    roomsService.findByDoctorAndRoomId.mockResolvedValue({
      id: 'r1',
      hospitalId: 'thb',
      available: false,
    });

    await expect(
      service.create(patientUser as never, {
        hospitalId: 'thb',
        doctorId: 'd2',
        roomId: 'r1',
        complaint: 'Kontrol rutin diabetes',
      }),
    ).rejects.toThrow(ForbiddenException);
  });

  it('returns booking lists for admin and doctor', async () => {
    await expect(service.findAll(adminUser as never)).resolves.toEqual({
      items: [expect.objectContaining({ id: 'b1' })],
    });
    await expect(service.findAll(doctorUser as never)).resolves.toEqual({
      items: [expect.objectContaining({ doctorId: 'd2' })],
    });
  });

  it('rejects list for unsupported role', async () => {
    await expect(service.findAll(patientUser as never)).rejects.toThrow(
      ForbiddenException,
    );
  });

  it('handles doctor-assigned listing and doctorId validation', async () => {
    await expect(
      service.findAssignedToDoctor(doctorUser as never),
    ).resolves.toEqual({
      items: [expect.objectContaining({ doctorId: 'd2' })],
    });

    await expect(
      service.findAssignedToDoctor(patientUser as never),
    ).rejects.toThrow(ForbiddenException);

    await expect(
      service.findAll({
        ...doctorUser,
        doctorId: undefined,
      } as never),
    ).rejects.toThrow(ForbiddenException);
  });

  it('enforces booking access rules for patient and doctor', async () => {
    bookingsRepository.findById.mockResolvedValue(
      makeBooking({ userId: 'u-other' }),
    );
    await expect(
      service.findOne('b1', patientUser as never),
    ).rejects.toThrow(ForbiddenException);

    bookingsRepository.findById.mockResolvedValue(
      makeBooking({ doctorId: 'd9' }),
    );
    await expect(
      service.findOne('b1', doctorUser as never),
    ).rejects.toThrow(ForbiddenException);
  });

  it('rejects update for doctor role and non-admin status change', async () => {
    await expect(
      service.update(
        'b1',
        doctorUser as never,
        { complaint: 'baru' } as never,
      ),
    ).rejects.toThrow(ForbiddenException);

    await expect(
      service.update(
        'b1',
        patientUser as never,
        { status: BookingStatus.CONFIRMED } as never,
      ),
    ).rejects.toThrow(ForbiddenException);
  });

  it('updates booking and recalculates queue when hospital changes', async () => {
    hospitalsService.findById.mockResolvedValueOnce({
      id: 'primaya-lu',
      name: 'RS Primaya Lingkar Utara',
    });
    doctorsService.findById.mockResolvedValueOnce({
      id: 'd3',
      hospitalId: 'primaya-lu',
      name: 'dr. Bagus Pratama',
      specialty: 'Stroke',
      available: true,
    });
    roomsService.findByDoctorAndRoomId.mockResolvedValueOnce({
      id: 'pr1',
      hospitalId: 'primaya-lu',
      name: 'VIP 12',
      type: 'VIP',
      available: true,
    });
    bookingsRepository.findById.mockResolvedValueOnce(makeBooking());
    bookingsRepository.countActiveByHospitalId.mockResolvedValueOnce(2);
    bookingsRepository.update.mockResolvedValueOnce(
      makeBooking({
        hospitalId: 'primaya-lu',
        doctorId: 'd3',
        roomId: 'pr1',
        queueNumber: 3,
        etaMinutes: 36,
      }),
    );

    await expect(
      service.update('b1', adminUser as never, {
        hospitalId: 'primaya-lu',
        doctorId: 'd3',
        roomId: 'pr1',
        complaint: '  kontrol stroke  ',
      } as never),
    ).resolves.toEqual({
      item: expect.any(Object),
    });

    expect(bookingsRepository.update).toHaveBeenCalledWith(
      'b1',
      expect.objectContaining({
        hospitalId: 'primaya-lu',
        doctorId: 'd3',
        roomId: 'pr1',
        complaint: 'kontrol stroke',
        queueNumber: 3,
        etaMinutes: 36,
      }),
    );
  });

  it('updates status only for admin', async () => {
    await expect(
      service.updateStatus('b1', patientUser as never, {
        status: BookingStatus.CONFIRMED,
      }),
    ).rejects.toThrow(ForbiddenException);

    await expect(
      service.updateStatus('b1', adminUser as never, {
        status: BookingStatus.CONFIRMED,
      }),
    ).resolves.toEqual({
      item: expect.objectContaining({ id: 'b1' }),
    });
  });

  it('deletes booking only when access is allowed', async () => {
    await expect(service.delete('b1', adminUser as never)).resolves.toEqual({
      ok: true,
    });
    expect(bookingsRepository.delete).toHaveBeenCalledWith('b1');

    bookingsRepository.findById.mockResolvedValueOnce(
      makeBooking({ userId: 'u-other' }),
    );
    await expect(
      service.delete('b1', patientUser as never),
    ).rejects.toThrow(ForbiddenException);
  });

  it('creates prescription only for admin', async () => {
    await expect(
      service.createPrescription('b1', patientUser as never, {
        stage: 'STADIUM_1',
        items: ['Obat'],
        notes: '',
      } as never),
    ).rejects.toThrow(ForbiddenException);

    await expect(
      service.createPrescription('b1', adminUser as never, {
        stage: 'STADIUM_1',
        items: ['Obat'],
        notes: 'Catatan',
      } as never),
    ).resolves.toEqual({
      item: expect.objectContaining({ id: 'b1' }),
    });
  });

  it('submits doctor review for assigned doctor only', async () => {
    bookingsRepository.findById.mockResolvedValue(
      makeBooking({ doctorId: 'd2', status: BookingStatus.CONFIRMED }),
    );

    await expect(
      service.submitDoctorReview('b1', doctorUser as never, {
        symptoms: 'Sering haus',
        diagnosis: 'Diabetes',
        estimatedCost: 350000,
        healthAdvice: 'Kurangi gula',
        stage: 'STADIUM_1',
        items: ['Metformin'],
        notes: 'Kontrol 1 minggu',
      }),
    ).resolves.toEqual({
      item: expect.objectContaining({ status: BookingStatus.REVIEWED_BY_DOCTOR }),
    });
  });

  it('rejects doctor review from wrong doctor or wrong status', async () => {
    bookingsRepository.findById.mockResolvedValue(
      makeBooking({ doctorId: 'd3', status: BookingStatus.CONFIRMED }),
    );
    await expect(
      service.submitDoctorReview('b1', doctorUser as never, {
        symptoms: 'Sering haus',
        diagnosis: 'Diabetes',
        estimatedCost: 350000,
        healthAdvice: 'Kurangi gula',
        stage: 'STADIUM_1',
        items: ['Metformin'],
        notes: 'Kontrol 1 minggu',
      }),
    ).rejects.toThrow(ForbiddenException);

    bookingsRepository.findById.mockResolvedValue(
      makeBooking({ doctorId: 'd2', status: BookingStatus.PENDING }),
    );
    await expect(
      service.submitDoctorReview('b1', doctorUser as never, {
        symptoms: 'Sering haus',
        diagnosis: 'Diabetes',
        estimatedCost: 350000,
        healthAdvice: 'Kurangi gula',
        stage: 'STADIUM_1',
        items: ['Metformin'],
        notes: 'Kontrol 1 minggu',
      }),
    ).rejects.toThrow(ForbiddenException);
  });

  it('rejects doctor review for non-doctor user', async () => {
    await expect(
      service.submitDoctorReview('b1', patientUser as never, {
        symptoms: 'Sering haus',
        diagnosis: 'Diabetes',
        estimatedCost: 350000,
        healthAdvice: 'Kurangi gula',
        stage: 'STADIUM_1',
        items: ['Metformin'],
        notes: 'Kontrol 1 minggu',
      }),
    ).rejects.toThrow(ForbiddenException);
  });

  it('throws not found when booking is missing', async () => {
    bookingsRepository.findById.mockResolvedValue(null);

    await expect(service.findOne('missing', adminUser as never)).rejects.toThrow(
      NotFoundException,
    );
  });
});

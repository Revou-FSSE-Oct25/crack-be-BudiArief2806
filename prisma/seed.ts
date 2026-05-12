import { PrismaClient } from '@prisma/client';
import { scryptSync, randomBytes } from 'crypto';
import {
  BookingStatus,
  DiseaseStage,
  Role,
  RoomType,
  Specialty,
} from '../src/common/enums/domain.enums';
import { createPrismaAdapter } from '../src/prisma/prisma.adapter';

// Seed memakai adapter PostgreSQL yang sama dengan runtime backend.
const prisma = new PrismaClient({
  adapter: createPrismaAdapter(),
});

function hashPassword(password: string): string {
  const salt = randomBytes(16).toString('hex');
  const derivedKey = scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${derivedKey}`;
}

async function main() {
  // Bersihkan relasi availability per dokter lebih dulu agar seed selalu konsisten.
  await prisma.doctorRoomAvailability.deleteMany();
  await prisma.doctorReview.deleteMany();
  await prisma.prescription.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.room.deleteMany();
  await prisma.doctor.deleteMany();
  await prisma.hospital.deleteMany();
  await prisma.user.deleteMany();

  const adminPassword = hashPassword('admin1234');
  const doctorPassword = hashPassword('doctor1234');
  const userPassword = hashPassword('user1234');

  await prisma.user.create({
    data: {
      name: 'Admin Diabstrok',
      email: 'admin@diabstrok.id',
      password: adminPassword,
      role: Role.ADMIN,
    },
  });

  const user = await prisma.user.create({
    data: {
      name: 'Rina Diabstrok',
      email: 'rina@diabstrok.id',
      password: userPassword,
      role: Role.USER,
    },
  });

  const doctorAccounts = await Promise.all([
    prisma.user.create({
      data: {
        name: 'dr. Andi Saputra',
        email: 'andi@diabstrok.id',
        password: doctorPassword,
        role: Role.DOCTOR,
      },
    }),
    prisma.user.create({
      data: {
        name: 'dr. Siti Rahma',
        email: 'siti@diabstrok.id',
        password: doctorPassword,
        role: Role.DOCTOR,
      },
    }),
    prisma.user.create({
      data: {
        name: 'dr. Bagus Pratama',
        email: 'bagus@diabstrok.id',
        password: doctorPassword,
        role: Role.DOCTOR,
      },
    }),
    prisma.user.create({
      data: {
        name: 'dr. Nanda Wijaya',
        email: 'nanda@diabstrok.id',
        password: doctorPassword,
        role: Role.DOCTOR,
      },
    }),
  ]);

  await prisma.hospital.createMany({
    data: [
      {
        id: 'thb',
        name: 'RS Taman Harapan Baru',
        lat: -6.1978,
        lng: 107.0024,
      },
      {
        id: 'primaya-lu',
        name: 'RS Primaya Lingkar Utara',
        lat: -6.2252,
        lng: 107.0016,
      },
    ],
  });

  await prisma.doctor.createMany({
    data: [
      {
        id: 'd1',
        hospitalId: 'thb',
        userId: doctorAccounts[0].id,
        name: 'dr. Andi Saputra',
        specialty: Specialty.UMUM,
        available: true,
      },
      {
        id: 'd2',
        hospitalId: 'thb',
        userId: doctorAccounts[1].id,
        name: 'dr. Siti Rahma',
        specialty: Specialty.DIABETES,
        available: true,
      },
      {
        id: 'd3',
        hospitalId: 'primaya-lu',
        userId: doctorAccounts[2].id,
        name: 'dr. Bagus Pratama',
        specialty: Specialty.STROKE,
        available: true,
      },
      {
        id: 'd4',
        hospitalId: 'primaya-lu',
        userId: doctorAccounts[3].id,
        name: 'dr. Nanda Wijaya',
        specialty: Specialty.UMUM,
        // Dokter umum Primaya tetap aktif.
        // Status "penuh" sekarang akan ditentukan oleh kombinasi dokter dan ruangannya.
        available: true,
      },
    ],
  });

  await prisma.room.createMany({
    data: [
      {
        id: 'r1',
        hospitalId: 'thb',
        name: 'VIP 01',
        type: RoomType.VIP,
        available: true,
      },
      {
        id: 'r2',
        hospitalId: 'thb',
        name: 'Kelas 1A',
        type: RoomType.KELAS_1,
        available: true,
      },
      {
        id: 'r3',
        hospitalId: 'thb',
        name: 'ICU-1',
        type: RoomType.ICU,
        available: true,
      },
      {
        id: 'pr1',
        hospitalId: 'primaya-lu',
        name: 'VIP 12',
        type: RoomType.VIP,
        available: true,
      },
      {
        id: 'pr2',
        hospitalId: 'primaya-lu',
        name: 'Kelas 2D',
        type: RoomType.KELAS_2,
        available: true,
      },
      {
        id: 'pr3',
        hospitalId: 'primaya-lu',
        name: 'ICU-2',
        type: RoomType.ICU,
        available: true,
      },
    ],
  });

  // Availability ruangan sekarang dibedakan per dokter.
  // Ruangan yang sama bisa penuh untuk satu dokter tetapi tetap tersedia untuk dokter lain.
  await prisma.doctorRoomAvailability.createMany({
    data: [
      { doctorId: 'd1', roomId: 'r1', available: true },
      { doctorId: 'd1', roomId: 'r2', available: true },
      { doctorId: 'd1', roomId: 'r3', available: true },
      { doctorId: 'd2', roomId: 'r1', available: true },
      { doctorId: 'd2', roomId: 'r2', available: true },
      { doctorId: 'd2', roomId: 'r3', available: true },
      { doctorId: 'd3', roomId: 'pr1', available: true },
      { doctorId: 'd3', roomId: 'pr2', available: true },
      { doctorId: 'd3', roomId: 'pr3', available: true },
      { doctorId: 'd4', roomId: 'pr1', available: false },
      { doctorId: 'd4', roomId: 'pr2', available: true },
      { doctorId: 'd4', roomId: 'pr3', available: true },
    ],
  });

  const firstBooking = await prisma.booking.create({
    data: {
      userId: user.id,
      patientName: user.name,
      patientAge: 46,
      hospitalId: 'thb',
      doctorId: 'd2',
      roomId: 'r1',
      complaint: 'Kontrol rutin diabetes dan cek tekanan darah',
      status: BookingStatus.REVIEWED_BY_DOCTOR,
      queueNumber: 1,
      etaMinutes: 15,
    },
  });

  await prisma.doctorReview.create({
    data: {
      bookingId: firstBooking.id,
      symptoms: 'Pasien sering haus, cepat lelah, dan gula darah pagi cenderung tinggi.',
      diagnosis: 'Diabetes melitus tipe 2 terkontrol parsial.',
      estimatedCost: 350000,
      healthAdvice: 'Kurangi gula sederhana, jalan kaki ringan, dan kontrol ulang 1 minggu.',
      createdByUserId: doctorAccounts[1].id,
    },
  });

  await prisma.prescription.create({
    data: {
      bookingId: firstBooking.id,
      stage: DiseaseStage.STADIUM_1,
      itemsJson: JSON.stringify([
        'Metformin 500mg 2x sehari setelah makan',
        'Cek gula darah puasa 3 hari lagi',
      ]),
      notes: 'Kurangi konsumsi gula dan lakukan kontrol mingguan.',
      createdByUserId: doctorAccounts[1].id,
    },
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });

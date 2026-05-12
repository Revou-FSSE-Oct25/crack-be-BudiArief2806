// Enum domain utama aplikasi.
// Enum dipakai agar nilai tertentu konsisten di seluruh project
// dan mengurangi typo saat dipakai oleh DTO, entity, service, atau controller.
export enum Role {
  // Role admin biasanya punya hak akses lebih tinggi seperti melihat semua booking
  // atau membuat resep.
  ADMIN = 'admin',

  // Role doctor menangani review medis atas booking yang dikirim admin.
  DOCTOR = 'doctor',

  // Role user adalah pengguna biasa yang melakukan registrasi dan booking.
  USER = 'user',
}

export enum Specialty {
  // Dokter umum untuk kebutuhan pemeriksaan dasar.
  UMUM = 'Umum',

  // Dokter/layanan fokus diabetes.
  DIABETES = 'Diabetes',

  // Dokter/layanan fokus stroke.
  STROKE = 'Stroke',
}

export enum BookingStatus {
  // Booking baru dibuat dan masih menunggu proses lanjut.
  PENDING = 'PENDING',

  // Booking sudah dikonfirmasi admin dan siap ditindaklanjuti dokter.
  CONFIRMED = 'CONFIRMED',

  // Dokter sudah mengirim balik hasil review ke admin.
  REVIEWED_BY_DOCTOR = 'REVIEWED_BY_DOCTOR',

  // Booking selesai dijalankan.
  COMPLETED = 'COMPLETED',
}

export enum DiseaseStage {
  // Stadium penyakit dipakai pada data resep atau hasil penanganan.
  STADIUM_1 = 'STADIUM_1',
  STADIUM_2 = 'STADIUM_2',
  STADIUM_3 = 'STADIUM_3',
}

export enum RoomType {
  // Tipe ruangan yang tersedia pada rumah sakit.
  VIP = 'VIP',
  KELAS_1 = 'Kelas 1',
  KELAS_2 = 'Kelas 2',
  ICU = 'ICU',
}

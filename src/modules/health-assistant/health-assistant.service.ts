import { ForbiddenException, Injectable } from '@nestjs/common';
import { Role } from '../../common/enums/domain.enums';
import type { PublicUser } from '../users/entities/user.entity';
import { AskHealthAssistantDto } from './dto/ask-health-assistant.dto';
import { HealthAssistantRepository } from './health-assistant.repository';

@Injectable()
export class HealthAssistantService {
  constructor(private readonly repository: HealthAssistantRepository) {}

  async findMessages(user: PublicUser) {
    this.ensureUserRole(user);

    const items = await this.repository.findAllByUserId(user.id);
    return { items };
  }

  async ask(user: PublicUser, dto: AskHealthAssistantDto) {
    this.ensureUserRole(user);

    const message = dto.message.trim();
    const topic = this.detectTopic(message);

    const userMessage = await this.repository.create({
      userId: user.id,
      role: 'user',
      message,
      topic,
    });

    const assistantMessage = await this.repository.create({
      userId: user.id,
      role: 'assistant',
      message: this.buildAssistantAnswer(message, topic),
      topic,
    });

    return {
      userMessage,
      assistantMessage,
    };
  }

  private ensureUserRole(user: PublicUser) {
    if (user.role !== Role.USER) {
      throw new ForbiddenException(
        'Health assistant is available for user accounts only',
      );
    }
  }

  private detectTopic(message: string) {
    const lower = message.toLowerCase();

    if (
      /(stroke|pelo|bicara pelo|mulut mencong|lengan lemah|fast|tekanan darah)/.test(
        lower,
      )
    ) {
      return 'stroke';
    }

    if (
      /(diabetes|gula darah|insulin|metformin|hb1ac|hba1c|hipoglikemi|hiperglikemi)/.test(
        lower,
      )
    ) {
      return 'diabetes';
    }

    if (/(makanan|diet|olahraga|jalan kaki|minum|tidur)/.test(lower)) {
      return 'lifestyle';
    }

    if (/(darurat|gawat|sesak|pingsan|kejang|nyeri dada|sulit bicara)/.test(lower)) {
      return 'emergency';
    }

    return 'general';
  }

  private buildAssistantAnswer(message: string, topic: string) {
    const lower = message.toLowerCase();

    if (
      /(mulut mencong|bicara pelo|lengan lemah|kaki lemah|pingsan|kejang|nyeri dada|sesak|penglihatan mendadak kabur|sakit kepala hebat)/.test(
        lower,
      )
    ) {
      return [
        'Ini terlihat seperti gejala yang berpotensi darurat. Segera minta bantuan keluarga dan menuju IGD atau rumah sakit terdekat.',
        'Chat ini hanya untuk edukasi umum dan tidak menggantikan pemeriksaan dokter.',
        'Jika memungkinkan, segera buat booking atau datang langsung untuk penanganan cepat.',
      ].join(' ');
    }

    if (topic === 'diabetes') {
      return [
        'Untuk diabetes, fokus utama biasanya ada pada kontrol gula darah, pola makan teratur, aktivitas fisik ringan, serta kepatuhan minum obat sesuai anjuran dokter.',
        'Batasi minuman manis, kue, dan makanan tinggi karbohidrat sederhana. Pilih porsi yang lebih seimbang dan cek gula darah secara berkala.',
        'Kalau kamu sering haus, sering buang air kecil, atau luka sulit sembuh, sebaiknya lanjut konsultasi ke dokter melalui booking agar mendapat evaluasi lebih tepat.',
      ].join(' ');
    }

    if (topic === 'stroke') {
      return [
        'Untuk pencegahan stroke, hal penting yang perlu diperhatikan adalah tekanan darah, gula darah, kolesterol, aktivitas fisik, dan kepatuhan minum obat.',
        'Kenali tanda FAST: wajah menurun, lengan lemah, bicara pelo, dan waktu untuk segera mencari bantuan medis.',
        'Jika ada keluhan mendadak seperti kelemahan sebelah tubuh atau bicara sulit, jangan menunggu dan segera ke fasilitas kesehatan.',
      ].join(' ');
    }

    if (topic === 'lifestyle') {
      return [
        'Pola hidup sehat sangat membantu mengurangi risiko diabetes dan stroke. Mulailah dari jalan kaki rutin, tidur cukup, minum air yang cukup, dan makan dengan porsi lebih seimbang.',
        'Kurangi makanan tinggi gula, garam, dan lemak jenuh. Jika kamu sudah punya diagnosis sebelumnya, ikuti kontrol rutin sesuai jadwal dokter.',
      ].join(' ');
    }

    return [
      'Saya bisa membantu memberikan edukasi umum seputar diabetes, stroke, pola makan, gejala awal, dan kapan sebaiknya mencari bantuan medis.',
      'Untuk jawaban yang lebih aman, ceritakan gejalamu atau topik yang ingin ditanyakan dengan lebih spesifik.',
      'Perlu diingat, chat ini bukan diagnosis dokter dan tidak menggantikan pemeriksaan langsung.',
    ].join(' ');
  }
}

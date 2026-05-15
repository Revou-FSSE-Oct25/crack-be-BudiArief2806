import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { HealthAssistantMessageEntity } from './entities/health-assistant.entity';

@Injectable()
export class HealthAssistantRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAllByUserId(userId: string): Promise<HealthAssistantMessageEntity[]> {
    const messages = await this.prisma.healthAssistantMessage.findMany({
      where: { userId },
      orderBy: {
        createdAt: 'asc',
      },
    });

    return messages.map((message) => this.toEntity(message));
  }

  async create(payload: {
    userId: string;
    role: 'user' | 'assistant';
    message: string;
    topic?: string | null;
  }): Promise<HealthAssistantMessageEntity> {
    const created = await this.prisma.healthAssistantMessage.create({
      data: payload,
    });

    return this.toEntity(created);
  }

  private toEntity(message: {
    id: string;
    userId: string;
    role: string;
    message: string;
    topic: string | null;
    createdAt: Date;
    updatedAt: Date;
  }): HealthAssistantMessageEntity {
    return {
      id: message.id,
      userId: message.userId,
      role: message.role as 'user' | 'assistant',
      message: message.message,
      topic: message.topic,
      createdAt: message.createdAt.toISOString(),
      updatedAt: message.updatedAt.toISOString(),
    };
  }
}

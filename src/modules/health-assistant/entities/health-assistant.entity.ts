export type HealthAssistantMessageRole = 'user' | 'assistant';

export class HealthAssistantMessageEntity {
  id!: string;
  userId!: string;
  role!: HealthAssistantMessageRole;
  message!: string;
  topic?: string | null;
  createdAt!: string;
  updatedAt!: string;
}

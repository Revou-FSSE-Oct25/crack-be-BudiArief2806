import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';

export function createPrismaAdapter() {
  // Adapter PostgreSQL membaca connection string yang sama dengan Prisma CLI.
  return new PrismaPg({
    connectionString: process.env.DATABASE_URL ?? '',
  });
}

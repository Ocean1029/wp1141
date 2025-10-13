// Prisma client singleton instance
import { PrismaClient } from '@prisma/client';
import { env } from './env';

// Create Prisma client with logging in development
const prisma = new PrismaClient({
  log: env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

// Graceful shutdown
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});

export default prisma;


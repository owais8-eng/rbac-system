import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private pool: Pool;
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    const dbUrl = process.env.DATABASE_URL;

    if (!dbUrl) {
      throw new Error('DATABASE_URL is undefined! Did you forget to load .env?');
    }

    const pool = new Pool({
      connectionString: dbUrl,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
    });
    const adapter = new PrismaPg(pool);

    super({ adapter });

    this.pool = pool;
  }

  async onModuleInit() {
    const self = this as any;
    await self.$connect();
    this.logger.log('Database connected successfully');

    if (process.env.NODE_ENV === 'development') {
      self.$on('query', (e: any) => {
        this.logger.debug(`Query: ${e.query} - Duration: ${e.duration}ms`);
      });
    }
  }

  async onModuleDestroy() {
    const self = this as any;
    await self.$disconnect();
    await this.pool.end();
  }
}
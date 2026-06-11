import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private pool: Pool;

  constructor() {
    const dbUrl = process.env.DATABASE_URL;

    // ✅ تحقق إضافي
    if (!dbUrl) {
      throw new Error('❌ DATABASE_URL is undefined! Did you forget to load .env?');
    }

    console.log('🔌 Connecting to DB...');

    const pool = new Pool({ connectionString: dbUrl });
    const adapter = new PrismaPg(pool);

    super({ adapter });
    this.pool = pool;
  }

  async onModuleInit() {
    await this.$connect();
    console.log('✅ Database connected successfully');
  }

  async onModuleDestroy() {
    await this.$disconnect();
    await this.pool.end();
  }
}
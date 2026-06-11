import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuditService {
  constructor(private prisma: PrismaService) { }

  async log(params: {
    action: string;
    entity: string;
    entityId?: number;
    userId?: number;
    userEmail?: string;
    metadata?: any;
  }) {
    await this.prisma.auditLog.create({ data: params });
  }
}

import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PermissionsService {
  constructor(private prisma: PrismaService) { }

  async create(dto: { name: string; description?: string }) {
    return this.prisma.permission.create({ data: dto });
  }

  async findAll() {
    return this.prisma.permission.findMany({
      include: { _count: { select: { roles: true } } },
    });
  }

  async findOne(id: number) {
    const perm = await this.prisma.permission.findUnique({
      where: { id },
      include: { roles: true },
    });
    if (!perm) throw new NotFoundException('Permission not found');
    return perm;
  }

  async update(id: number, dto: { name?: string; description?: string }) {
    return this.prisma.permission.update({ where: { id }, data: dto });
  }

  async remove(id: number) {
    return this.prisma.permission.delete({ where: { id } });
  }
}
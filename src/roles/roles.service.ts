import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class RolesService {
  constructor(private readonly prisma: PrismaService) { }

  async create(dto: { name: string; description?: string }) {
    return this.prisma.role.create({ data: dto });
  }

  async findAll() {
    return this.prisma.role.findMany({
      include: { permissions: true, _count: { select: { users: true } } },
    });
  }

  async findOne(id: number) {
    const role = await this.prisma.role.findUnique({
      where: { id },
      include: { permissions: true, users: true },
    });
    if (!role) throw new NotFoundException('Role not found');
    return role;
  }

  async update(id: number, dto: { name?: string; description?: string }) {
    return this.prisma.role.update({ where: { id }, data: dto });
  }

  async remove(id: number) {
    const role = await this.prisma.role.findUnique({
      where: { id },
      include: { users: true },
    });
    if (role?.users && role.users.length > 0) {
      throw new BadRequestException('Cannot delete role assigned to users');
    }
    return this.prisma.role.delete({ where: { id } });
  }

  async assignPermissions(roleId: number, permissionIds: number[]) {
    return this.prisma.role.update({
      where: { id: roleId },
      data: {
        permissions: { connect: permissionIds.map(id => ({ id })) },
      },
      include: { permissions: true },
    });
  }

  async removePermissions(roleId: number, permissionIds: number[]) {
    return this.prisma.role.update({
      where: { id: roleId },
      data: {
        permissions: { disconnect: permissionIds.map(id => ({ id })) },
      },
      include: { permissions: true },
    });
  }
}
import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) { }

  async create(dto: any) {
    if (!dto?.password) throw new BadRequestException('Password is required');

    const hashed = await bcrypt.hash(dto.password, 10);
    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        name: dto.name,
        password: hashed,
        isActive: dto.isActive ?? true,
      },
    });

    const { password, ...result } = user;
    return result;
  }

  async findAll() {
    const users = await this.prisma.user.findMany({
      where: { deletedAt: null },
      include: { roles: { include: { permissions: true } }, permissions: true },
    });
    return users.map(u => {
      const { password, ...rest } = u;
      return rest;
    });
  }

  async findById(id: number) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: { roles: { include: { permissions: true } }, permissions: true },
    });
    if (!user) throw new NotFoundException('User not found');
    const { password, ...result } = user;
    return result;
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
      include: { roles: { include: { permissions: true } }, permissions: true },
    });
  }

  async update(id: number, dto: any) {
    const data: any = { ...dto };
    if (dto.password) data.password = await bcrypt.hash(dto.password, 10);

    const user = await this.prisma.user.update({
      where: { id },
      data,
      include: { roles: { include: { permissions: true } }, permissions: true },
    });

    const { password, ...result } = user;
    return result;
  }

  async remove(id: number) {
    const user = await this.prisma.user.update({
      where: { id },
      data: { deletedAt: new Date(), isActive: false },
    });
    const { password, ...result } = user;
    return result;
  }

  async assignRoles(userId: number, roleIds: number[]) {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: {
        roles: { connect: roleIds.map(id => ({ id })) },
      },
      include: { roles: { include: { permissions: true } } },
    });
    const { password, ...result } = user;
    return result;
  }

  async removeRoles(userId: number, roleIds: number[]) {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: {
        roles: { disconnect: roleIds.map(id => ({ id })) },
      },
      include: { roles: { include: { permissions: true } } },
    });
    const { password, ...result } = user;
    return result;
  }

  async assignPermissions(userId: number, permissionIds: number[]) {
    if (!permissionIds?.length) throw new BadRequestException('permissionIds must be a non-empty array');
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: {
        permissions: { connect: permissionIds.map(id => ({ id })) },
      },
      include: { roles: { include: { permissions: true } }, permissions: true },
    });
    const { password, ...result } = user;
    return result;
  }

  async removePermissions(userId: number, permissionIds: number[]) {
    if (!permissionIds?.length) throw new BadRequestException('permissionIds must be a non-empty array');
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: {
        permissions: { disconnect: permissionIds.map(id => ({ id })) },
      },
      include: { roles: { include: { permissions: true } }, permissions: true },
    });
    const { password, ...result } = user;
    return result;
  }
}
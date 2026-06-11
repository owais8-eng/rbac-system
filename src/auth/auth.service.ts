import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private prisma: PrismaService,
  ) { }

  async validateUser(email: string, pass: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) return null;
    const match = await bcrypt.compare(pass, user.password);
    if (!match) return null;
    const { password, ...rest } = user as any;
    return rest;
  }

  private async generateTokens(payload: { sub: number; email: string; roles: string[] }) {
    const accessToken = jwt.sign(payload, process.env.JWT_SECRET || 'dev-secret', {
      expiresIn: '1h' as any,
    });

    const refreshToken = jwt.sign(
      payload,
      process.env.REFRESH_TOKEN_SECRET || 'refresh-dev-secret',
      { expiresIn: process.env.REFRESH_TOKEN_EXPIRY || '7d' } as any,
    );

    const decoded = jwt.decode(refreshToken) as { exp: number };
    await this.prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: payload.sub,
        expiresAt: new Date(decoded.exp * 1000),
      },
    });

    return { access_token: accessToken, refresh_token: refreshToken };
  }

  async login(user: any) {
    const payload = {
      sub: user.id,
      email: user.email,
      roles: user.roles?.map((r: any) => r.name) || [],
    };

    return this.generateTokens(payload);
  }

  async refresh(refreshToken: string) {
    const stored = await this.prisma.refreshToken.findUnique({
      where: { token: refreshToken },
    });

    if (!stored || stored.revoked) {
      throw new UnauthorizedException('Refresh token is revoked or not found');
    }

    try {
      const payload = jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET || 'refresh-dev-secret',
      ) as unknown as { sub: number; email: string; roles: string[] };

      const user = await this.usersService.findByEmail(payload.email);
      if (!user) throw new UnauthorizedException('User not found');

      await this.prisma.refreshToken.update({
        where: { id: stored.id },
        data: { revoked: true },
      });

      return this.generateTokens({
        sub: user.id,
        email: user.email,
        roles: user.roles?.map((r: any) => r.name) || [],
      });
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }

  async logout(refreshToken: string) {
    await this.prisma.refreshToken.updateMany({
      where: { token: refreshToken },
      data: { revoked: true },
    });
  }
}
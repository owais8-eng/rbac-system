import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { CacheModule } from '@nestjs/cache-manager';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { RolesModule } from './roles/roles.module';
import { PermissionsModule } from './permissions/permissions.module';
import { PrismaModule } from './prisma/prisma.module';
import { AuditModule } from './audit/audit.module';
import { AuditInterceptor } from './audit/audit.interceptor';

@Module({
  imports: [
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 30 }]),
    CacheModule.register({ ttl: 30, max: 100, isGlobal: true }),
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    UsersModule,
    RolesModule,
    PermissionsModule,
    AuditModule,
  ],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: AuditInterceptor,
    },
  ],
})
export class AppModule { }
import { Module } from '@nestjs/common';
import { RolesService } from './roles.service';
import { RolesController } from './roles.controller';
import { PermissionsGuard } from '../auth/permissions.guard';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [RolesService, PermissionsGuard],
  controllers: [RolesController],
  exports: [RolesService],
})
export class RolesModule { }
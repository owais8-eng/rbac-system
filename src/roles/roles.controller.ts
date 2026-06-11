import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
} from '@nestjs/common';
import { RolesService } from './roles.service';
import { RequirePermissions } from '../common/decorators/require-permissions.decorator';

@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) { }

  @Post()
  @RequirePermissions('manage:roles')
  create(@Body() dto: { name: string; description?: string }) {
    return this.rolesService.create(dto);
  }

  @Get()
  @RequirePermissions('manage:roles')
  findAll() {
    return this.rolesService.findAll();
  }

  @Get(':id')
  @RequirePermissions('read:roles')
  findOne(@Param('id') id: string) {
    return this.rolesService.findOne(+id);
  }

  @Patch(':id')
  @RequirePermissions('update:roles')
  update(@Param('id') id: string, @Body() dto: { name?: string; description?: string }) {
    return this.rolesService.update(+id, dto);
  }

  @Delete(':id')
  @RequirePermissions('delete:roles')
  remove(@Param('id') id: string) {
    return this.rolesService.remove(+id);
  }

  @Post(':id/permissions')
  @RequirePermissions('manage:permissions')
  assignPermissions(@Param('id') id: string, @Body() body: { permissionIds: number[] }) {
    return this.rolesService.assignPermissions(+id, body.permissionIds);
  }

  @Delete(':id/permissions')
  @RequirePermissions('manage:permissions')
  removePermissions(@Param('id') id: string, @Body() body: { permissionIds: number[] }) {
    return this.rolesService.removePermissions(+id, body.permissionIds);
  }
}
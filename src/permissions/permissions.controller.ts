import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
} from '@nestjs/common';
import { PermissionsService } from './permissions.service';
import { RequirePermissions } from '../common/decorators/require-permissions.decorator';

@Controller('permissions')
export class PermissionsController {
  constructor(private readonly permissionsService: PermissionsService) { }

  @Post()
  @RequirePermissions('create:permissions')
  create(@Body() dto: { name: string; description?: string }) {
    return this.permissionsService.create(dto);
  }

  @Get()
  @RequirePermissions('read:permissions')
  findAll() {
    return this.permissionsService.findAll();
  }

  @Get(':id')
  @RequirePermissions('read:permissions')
  findOne(@Param('id') id: string) {
    return this.permissionsService.findOne(+id);
  }

  @Patch(':id')
  @RequirePermissions('update:permissions')
  update(@Param('id') id: string, @Body() dto: { name?: string; description?: string }) {
    return this.permissionsService.update(+id, dto);
  }

  @Delete(':id')
  @RequirePermissions('delete:permissions')
  remove(@Param('id') id: string) {
    return this.permissionsService.remove(+id);
  }
}
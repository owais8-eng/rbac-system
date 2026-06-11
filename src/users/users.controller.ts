import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { RequirePermissions } from '../common/decorators/require-permissions.decorator';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  @Post()
  @RequirePermissions('create:users')
  create(@Body() dto: CreateUserDto) {
    return this.usersService.create(dto);
  }

  @Get()
  @RequirePermissions('read:users')
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  @RequirePermissions('read:users')
  findOne(@Param('id') id: string) {
    return this.usersService.findById(+id);
  }

  @Patch(':id')
  @RequirePermissions('update:users')
  update(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    return this.usersService.update(+id, dto);
  }

  @Delete(':id')
  @RequirePermissions('delete:users')
  remove(@Param('id') id: string) {
    return this.usersService.remove(+id);
  }

  @Post(':id/roles')
  @RequirePermissions('manage:roles')
  assignRoles(@Param('id') id: string, @Body() body: { roleIds: number[] }) {
    return this.usersService.assignRoles(+id, body.roleIds);
  }
  
@Post(':id/roles/remove')
@RequirePermissions('manage:roles')
removeRoles(@Param('id') id: string, @Body() body: { roleIds: number[] }) {
  return this.usersService.removeRoles(+id, body.roleIds);
}

@Post(':id/permissions')
@RequirePermissions('manage:permissions')
assignPermissions(@Param('id') id: string, @Body() body: { permissionIds: number[] }) {
  return this.usersService.assignPermissions(+id, body.permissionIds);
}

@Post(':id/permissions/remove')
@RequirePermissions('manage:permissions')
removePermissions(@Param('id') id: string, @Body() body: { permissionIds: number[] }) {
  return this.usersService.removePermissions(+id, body.permissionIds);
}
}
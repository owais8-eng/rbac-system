import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { RoleIdsDto } from '../common/dto/role-ids.dto';
import { PermissionIdsDto } from '../common/dto/permission-ids.dto';
import { RequirePermissions } from '../common/decorators/require-permissions.decorator';

@ApiTags('Users')
@ApiBearerAuth('access-token')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  @Post()
  @RequirePermissions('create:users')
  @ApiOperation({ summary: 'Create a new user' })
  @ApiResponse({ status: 201, description: 'User created' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  create(@Body() dto: CreateUserDto) {
    return this.usersService.create(dto);
  }

  @Get()
  @RequirePermissions('read:users')
  @ApiOperation({ summary: 'List all users' })
  @ApiResponse({ status: 200, description: 'List of users' })
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  @RequirePermissions('read:users')
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiResponse({ status: 200, description: 'User found' })
  @ApiResponse({ status: 404, description: 'User not found' })
  findOne(@Param('id') id: string) {
    return this.usersService.findById(+id);
  }

  @Patch(':id')
  @RequirePermissions('update:users')
  @ApiOperation({ summary: 'Update user' })
  @ApiResponse({ status: 200, description: 'User updated' })
  @ApiResponse({ status: 404, description: 'User not found' })
  update(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    return this.usersService.update(+id, dto);
  }

  @Delete(':id')
  @RequirePermissions('delete:users')
  @ApiOperation({ summary: 'Soft delete user' })
  @ApiResponse({ status: 200, description: 'User deleted' })
  @ApiResponse({ status: 404, description: 'User not found' })
  remove(@Param('id') id: string) {
    return this.usersService.remove(+id);
  }

  @Post(':id/roles')
  @RequirePermissions('manage:roles')
  @ApiOperation({ summary: 'Assign roles to user' })
  @ApiResponse({ status: 201, description: 'Roles assigned' })
  assignRoles(@Param('id') id: string, @Body() body: RoleIdsDto) {
    return this.usersService.assignRoles(+id, body.roleIds);
  }

  @Post(':id/roles/remove')
  @RequirePermissions('manage:roles')
  @ApiOperation({ summary: 'Remove roles from user' })
  @ApiResponse({ status: 201, description: 'Roles removed' })
  removeRoles(@Param('id') id: string, @Body() body: RoleIdsDto) {
    return this.usersService.removeRoles(+id, body.roleIds);
  }

  @Post(':id/permissions')
  @RequirePermissions('manage:permissions')
  @ApiOperation({ summary: 'Assign permissions directly to user' })
  @ApiResponse({ status: 201, description: 'Permissions assigned' })
  assignPermissions(@Param('id') id: string, @Body() body: PermissionIdsDto) {
    return this.usersService.assignPermissions(+id, body.permissionIds);
  }

  @Post(':id/permissions/remove')
  @RequirePermissions('manage:permissions')
  @ApiOperation({ summary: 'Remove direct permissions from user' })
  @ApiResponse({ status: 201, description: 'Permissions removed' })
  removePermissions(@Param('id') id: string, @Body() body: PermissionIdsDto) {
    return this.usersService.removePermissions(+id, body.permissionIds);
  }
}

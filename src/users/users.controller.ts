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
  @ApiOperation({ summary: 'Create user', description: 'Create a new user account. Requires `create:users` permission.' })
  @ApiResponse({ status: 201, description: 'User created (password excluded)' })
  @ApiResponse({ status: 400, description: 'Validation error or duplicate email' })
  @ApiResponse({ status: 401, description: 'Missing or invalid access token' })
  @ApiResponse({ status: 403, description: 'Missing required permission: create:users' })
  create(@Body() dto: CreateUserDto) {
    return this.usersService.create(dto);
  }

  @Get()
  @RequirePermissions('read:users')
  @ApiOperation({ summary: 'List users', description: 'Get all active users. Requires `read:users` permission.' })
  @ApiResponse({ status: 200, description: 'Array of users' })
  @ApiResponse({ status: 401, description: 'Missing or invalid access token' })
  @ApiResponse({ status: 403, description: 'Missing required permission: read:users' })
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  @RequirePermissions('read:users')
  @ApiOperation({ summary: 'Get user', description: 'Get a single user by ID. Requires `read:users` permission.' })
  @ApiResponse({ status: 200, description: 'User found' })
  @ApiResponse({ status: 401, description: 'Missing or invalid access token' })
  @ApiResponse({ status: 403, description: 'Missing required permission: read:users' })
  @ApiResponse({ status: 404, description: 'User not found' })
  findOne(@Param('id') id: string) {
    return this.usersService.findById(+id);
  }

  @Patch(':id')
  @RequirePermissions('update:users')
  @ApiOperation({ summary: 'Update user', description: 'Update user details. Requires `update:users` permission.' })
  @ApiResponse({ status: 200, description: 'User updated' })
  @ApiResponse({ status: 401, description: 'Missing or invalid access token' })
  @ApiResponse({ status: 403, description: 'Missing required permission: update:users' })
  @ApiResponse({ status: 404, description: 'User not found' })
  update(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    return this.usersService.update(+id, dto);
  }

  @Delete(':id')
  @RequirePermissions('delete:users')
  @ApiOperation({ summary: 'Delete user', description: 'Soft-delete a user (sets deletedAt + isActive=false). Requires `delete:users` permission.' })
  @ApiResponse({ status: 200, description: 'User deleted' })
  @ApiResponse({ status: 401, description: 'Missing or invalid access token' })
  @ApiResponse({ status: 403, description: 'Missing required permission: delete:users' })
  @ApiResponse({ status: 404, description: 'User not found' })
  remove(@Param('id') id: string) {
    return this.usersService.remove(+id);
  }

  @Post(':id/roles')
  @RequirePermissions('manage:roles')
  @ApiOperation({ summary: 'Assign roles', description: 'Assign roles to a user. Requires `manage:roles` permission.' })
  @ApiResponse({ status: 201, description: 'Roles assigned' })
  @ApiResponse({ status: 401, description: 'Missing or invalid access token' })
  @ApiResponse({ status: 403, description: 'Missing required permission: manage:roles' })
  assignRoles(@Param('id') id: string, @Body() body: RoleIdsDto) {
    return this.usersService.assignRoles(+id, body.roleIds);
  }

  @Post(':id/roles/remove')
  @RequirePermissions('manage:roles')
  @ApiOperation({ summary: 'Remove roles', description: 'Remove roles from a user. Requires `manage:roles` permission.' })
  @ApiResponse({ status: 201, description: 'Roles removed' })
  @ApiResponse({ status: 401, description: 'Missing or invalid access token' })
  @ApiResponse({ status: 403, description: 'Missing required permission: manage:roles' })
  removeRoles(@Param('id') id: string, @Body() body: RoleIdsDto) {
    return this.usersService.removeRoles(+id, body.roleIds);
  }

  @Post(':id/permissions')
  @RequirePermissions('manage:permissions')
  @ApiOperation({ summary: 'Assign permissions', description: 'Assign permissions directly to a user (bypassing roles). Requires `manage:permissions` permission.' })
  @ApiResponse({ status: 201, description: 'Permissions assigned' })
  @ApiResponse({ status: 401, description: 'Missing or invalid access token' })
  @ApiResponse({ status: 403, description: 'Missing required permission: manage:permissions' })
  assignPermissions(@Param('id') id: string, @Body() body: PermissionIdsDto) {
    return this.usersService.assignPermissions(+id, body.permissionIds);
  }

  @Post(':id/permissions/remove')
  @RequirePermissions('manage:permissions')
  @ApiOperation({ summary: 'Remove direct permissions', description: 'Remove direct permissions from a user. Requires `manage:permissions` permission.' })
  @ApiResponse({ status: 201, description: 'Permissions removed' })
  @ApiResponse({ status: 401, description: 'Missing or invalid access token' })
  @ApiResponse({ status: 403, description: 'Missing required permission: manage:permissions' })
  removePermissions(@Param('id') id: string, @Body() body: PermissionIdsDto) {
    return this.usersService.removePermissions(+id, body.permissionIds);
  }
}

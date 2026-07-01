import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseInterceptors,
} from '@nestjs/common';
import { CacheInterceptor } from '@nestjs/cache-manager';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { RolesService } from './roles.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { PermissionIdsDto } from '../common/dto/permission-ids.dto';
import { RequirePermissions } from '../common/decorators/require-permissions.decorator';

@ApiTags('Roles')
@ApiBearerAuth('access-token')
@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) { }

  @Post()
  @RequirePermissions('manage:roles')
  @ApiOperation({ summary: 'Create role', description: 'Create a new role. Requires `manage:roles` permission.' })
  @ApiResponse({ status: 201, description: 'Role created' })
  @ApiResponse({ status: 400, description: 'Validation error or duplicate name' })
  @ApiResponse({ status: 401, description: 'Missing or invalid access token' })
  @ApiResponse({ status: 403, description: 'Missing required permission: manage:roles' })
  create(@Body() dto: CreateRoleDto) {
    return this.rolesService.create(dto);
  }

  @Get()
  @UseInterceptors(CacheInterceptor)
  @RequirePermissions('read:roles')
  @ApiOperation({ summary: 'List roles', description: 'Get all roles with their permissions. Requires `read:roles` permission.' })
  @ApiResponse({ status: 200, description: 'Array of roles with permissions' })
  @ApiResponse({ status: 401, description: 'Missing or invalid access token' })
  @ApiResponse({ status: 403, description: 'Missing required permission: read:roles' })
  findAll() {
    return this.rolesService.findAll();
  }

  @Get(':id')
  @UseInterceptors(CacheInterceptor)
  @RequirePermissions('read:roles')
  @ApiOperation({ summary: 'Get role', description: 'Get a single role by ID with its permissions and users. Requires `read:roles` permission.' })
  @ApiResponse({ status: 200, description: 'Role found' })
  @ApiResponse({ status: 401, description: 'Missing or invalid access token' })
  @ApiResponse({ status: 403, description: 'Missing required permission: read:roles' })
  @ApiResponse({ status: 404, description: 'Role not found' })
  findOne(@Param('id') id: string) {
    return this.rolesService.findOne(+id);
  }

  @Patch(':id')
  @RequirePermissions('update:roles')
  @ApiOperation({ summary: 'Update role', description: 'Update role name or description. Requires `update:roles` permission.' })
  @ApiResponse({ status: 200, description: 'Role updated' })
  @ApiResponse({ status: 401, description: 'Missing or invalid access token' })
  @ApiResponse({ status: 403, description: 'Missing required permission: update:roles' })
  @ApiResponse({ status: 404, description: 'Role not found' })
  update(@Param('id') id: string, @Body() dto: UpdateRoleDto) {
    return this.rolesService.update(+id, dto);
  }

  @Delete(':id')
  @RequirePermissions('delete:roles')
  @ApiOperation({ summary: 'Delete role', description: 'Delete a role. Fails if the role is assigned to any users. Requires `delete:roles` permission.' })
  @ApiResponse({ status: 200, description: 'Role deleted' })
  @ApiResponse({ status: 400, description: 'Cannot delete role assigned to users' })
  @ApiResponse({ status: 401, description: 'Missing or invalid access token' })
  @ApiResponse({ status: 403, description: 'Missing required permission: delete:roles' })
  @ApiResponse({ status: 404, description: 'Role not found' })
  remove(@Param('id') id: string) {
    return this.rolesService.remove(+id);
  }

  @Post(':id/permissions')
  @RequirePermissions('manage:permissions')
  @ApiOperation({ summary: 'Assign permissions to role', description: 'Attach permissions to a role. Requires `manage:permissions` permission.' })
  @ApiResponse({ status: 201, description: 'Permissions assigned' })
  @ApiResponse({ status: 401, description: 'Missing or invalid access token' })
  @ApiResponse({ status: 403, description: 'Missing required permission: manage:permissions' })
  assignPermissions(@Param('id') id: string, @Body() body: PermissionIdsDto) {
    return this.rolesService.assignPermissions(+id, body.permissionIds);
  }

  @Delete(':id/permissions')
  @RequirePermissions('manage:permissions')
  @ApiOperation({ summary: 'Remove permissions from role', description: 'Detach permissions from a role. Requires `manage:permissions` permission.' })
  @ApiResponse({ status: 200, description: 'Permissions removed' })
  @ApiResponse({ status: 401, description: 'Missing or invalid access token' })
  @ApiResponse({ status: 403, description: 'Missing required permission: manage:permissions' })
  removePermissions(@Param('id') id: string, @Body() body: PermissionIdsDto) {
    return this.rolesService.removePermissions(+id, body.permissionIds);
  }
}

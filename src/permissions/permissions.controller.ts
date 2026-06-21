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
import { PermissionsService } from './permissions.service';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { RequirePermissions } from '../common/decorators/require-permissions.decorator';

@ApiTags('Permissions')
@ApiBearerAuth('access-token')
@Controller('permissions')
export class PermissionsController {
  constructor(private readonly permissionsService: PermissionsService) { }

  @Post()
  @RequirePermissions('create:permissions')
  @ApiOperation({ summary: 'Create permission', description: 'Create a new permission. Requires `create:permissions` permission.' })
  @ApiResponse({ status: 201, description: 'Permission created' })
  @ApiResponse({ status: 400, description: 'Validation error or duplicate name' })
  @ApiResponse({ status: 401, description: 'Missing or invalid access token' })
  @ApiResponse({ status: 403, description: 'Missing required permission: create:permissions' })
  create(@Body() dto: CreatePermissionDto) {
    return this.permissionsService.create(dto);
  }

  @Get()
  @RequirePermissions('read:permissions')
  @ApiOperation({ summary: 'List permissions', description: 'Get all permissions with role usage count. Requires `read:permissions` permission.' })
  @ApiResponse({ status: 200, description: 'Array of permissions' })
  @ApiResponse({ status: 401, description: 'Missing or invalid access token' })
  @ApiResponse({ status: 403, description: 'Missing required permission: read:permissions' })
  findAll() {
    return this.permissionsService.findAll();
  }

  @Get(':id')
  @RequirePermissions('read:permissions')
  @ApiOperation({ summary: 'Get permission', description: 'Get a single permission by ID with its roles. Requires `read:permissions` permission.' })
  @ApiResponse({ status: 200, description: 'Permission found' })
  @ApiResponse({ status: 401, description: 'Missing or invalid access token' })
  @ApiResponse({ status: 403, description: 'Missing required permission: read:permissions' })
  @ApiResponse({ status: 404, description: 'Permission not found' })
  findOne(@Param('id') id: string) {
    return this.permissionsService.findOne(+id);
  }

  @Patch(':id')
  @RequirePermissions('update:permissions')
  @ApiOperation({ summary: 'Update permission', description: 'Update permission name or description. Requires `update:permissions` permission.' })
  @ApiResponse({ status: 200, description: 'Permission updated' })
  @ApiResponse({ status: 401, description: 'Missing or invalid access token' })
  @ApiResponse({ status: 403, description: 'Missing required permission: update:permissions' })
  @ApiResponse({ status: 404, description: 'Permission not found' })
  update(@Param('id') id: string, @Body() dto: UpdatePermissionDto) {
    return this.permissionsService.update(+id, dto);
  }

  @Delete(':id')
  @RequirePermissions('delete:permissions')
  @ApiOperation({ summary: 'Delete permission', description: 'Delete a permission. Requires `delete:permissions` permission.' })
  @ApiResponse({ status: 200, description: 'Permission deleted' })
  @ApiResponse({ status: 401, description: 'Missing or invalid access token' })
  @ApiResponse({ status: 403, description: 'Missing required permission: delete:permissions' })
  @ApiResponse({ status: 404, description: 'Permission not found' })
  remove(@Param('id') id: string) {
    return this.permissionsService.remove(+id);
  }
}

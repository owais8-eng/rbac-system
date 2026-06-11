import { Controller, Post, Body } from '@nestjs/common';
import { RequirePermissions } from '../common/decorators/require-permissions.decorator';

@Controller('posts')
export class PostsController {
  @Post()
  @RequirePermissions('create:posts')
  create(@Body() body: any) {
    return { ok: true, data: body };
  }
}

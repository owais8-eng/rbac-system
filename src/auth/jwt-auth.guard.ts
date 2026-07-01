import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from './public.decorator';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private readonly reflector: Reflector) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    // ✅ استخدم await هنا
    const result = await super.canActivate(context);
    return result as boolean;
  }

  handleRequest(err, user, info, context: ExecutionContext) {
    console.log('JWT info:', info);
    if (err || !user) {
      throw err || new UnauthorizedException('No auth header');
    }

    // ✅ ضع user في req يدوياً
    const request = context.switchToHttp().getRequest();
    request.user = user;

    return user;
  }
}
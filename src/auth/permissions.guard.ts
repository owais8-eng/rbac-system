import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from './require-permissions.decorator';

@Injectable()
export class PermissionsGuard implements CanActivate {
    constructor(private readonly reflector: Reflector) { } // ← no PrismaService needed

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const requiredPermissions = this.reflector.getAllAndOverride<string[]>(PERMISSIONS_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);

        if (!requiredPermissions) return true;

        const { user } = context.switchToHttp().getRequest();

        if (!user) throw new ForbiddenException('User not authenticated');

        // ✅ Already loaded by JwtStrategy.validate() — zero extra DB queries
        if (user.roles?.includes('admin')) return true;

        const hasAll = requiredPermissions.every(p => user.permissions?.includes(p));

        if (!hasAll) {
            throw new ForbiddenException(`Missing permissions: ${requiredPermissions.join(', ')}`);
        }

        return true;
    }
}
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
// 1. استيراد PrismaService لكي نتمكن من جلب الص
import { PrismaService } from '../../prisma/prisma.service';


@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(private prisma: PrismaService) {
        const secret = process.env.JWT_SECRET || 'dev-secret';
        console.log('🔑 Strategy secret:', secret);
        console.log('🔑 Using fallback:', !process.env.JWT_SECRET);
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: secret,
        });
    }

    async validate(payload: any) {
        console.log('✅ validate() called with:', payload); // if this never prints, secret is wrong
        const userWithRoles = await this.prisma.user.findUnique({
            where: { id: payload.sub },
            include: {
                roles: {
                    include: { permissions: true },
                },
                permissions: true,
            },
        });

        if (!userWithRoles) {
            throw new UnauthorizedException('المستخدم غير موجود');
        }

        const rolePermissions = userWithRoles.roles.flatMap(role =>
            role.permissions.map(permission => permission.name)
        );
        const directPermissions = userWithRoles.permissions.map(p => p.name);
        const allPermissions = [...new Set([...rolePermissions, ...directPermissions])];

        return {
            userId: payload.sub,
            email: payload.email,
            roles: payload.roles || [],
            permissions: allPermissions,
        };
    }
}
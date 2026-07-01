import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { AuditService } from './audit.service';

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(private readonly audit: AuditService) { }

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const method = request.method;
    const url = request.route?.path || request.url;
    const user = request.user;

    const skipRoutes = ['/auth/login', '/auth/refresh', '/auth/logout'];

    if (skipRoutes.some(r => url.startsWith(r))) {
      return next.handle();
    }

    return next.handle().pipe(
      tap(() => {
        const entity = url.split('/')[1];
        const entityId = this.extractId(url);

        this.audit.log({
          action: method,
          entity: entity || url,
          entityId,
          userId: user?.userId,
          userEmail: user?.email,
          metadata: { url, method },
        });
      }),
    );
  }

  private extractId(url: string): number | undefined {
    const parts = url.split('/');
    for (const part of parts) {
      const num = Number(part);
      if (!Number.isNaN(num)) return num;
    }
    return undefined;
  }
}

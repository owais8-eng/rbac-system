import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: string | string[] = 'Internal server error';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse();
      if (typeof res === 'string') {
        message = res;
      } else if (typeof res === 'object') {
        const obj = res as any;
        message = obj.message || obj.error || message;
      }
    } else if (exception instanceof Error) {
      message = exception.message;
    }

    response.status(status).json({
      statusCode: status,
      message,
      timestamp: new Date().toISOString(),
    });
  }
}

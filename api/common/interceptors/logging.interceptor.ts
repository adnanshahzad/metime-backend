import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request } from 'express';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<Request>();
    const { method, url } = request;
    const correlationId = request.headers['x-correlation-id'];
    const userId = (request as any).user?.sub;
    const companyId = (request as any).user?.companyId;

    const startTime = Date.now();

    return next.handle().pipe(
      tap({
        next: (data) => {
          const latency = Date.now() - startTime;
          const statusCode = context.switchToHttp().getResponse().statusCode;

          this.logger.log(
            `Request completed: ${method} ${url} - ${statusCode} - ${latency}ms`,
            {
              correlationId,
              userId,
              companyId,
              method,
              url,
              statusCode,
              latency,
            },
          );
        },
        error: (error) => {
          const latency = Date.now() - startTime;
          const statusCode = error.status || 500;

          this.logger.error(
            `Request failed: ${method} ${url} - ${statusCode} - ${latency}ms`,
            error.stack,
            {
              correlationId,
              userId,
              companyId,
              method,
              url,
              statusCode,
              latency,
            },
          );
        },
      }),
    );
  }
}

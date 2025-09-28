import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const message =
      exception instanceof HttpException
        ? exception.getResponse()
        : 'Internal server error';

    // Log full error details
    this.logger.error(
      `HTTP Exception: ${status} - ${JSON.stringify(message)}`,
      exception instanceof Error ? exception.stack : undefined,
      {
        correlationId: request.headers['x-correlation-id'],
        userId: (request as any).user?.sub,
        companyId: (request as any).user?.companyId,
        method: request.method,
        url: request.url,
        statusCode: status,
      },
    );

    // Return safe response to client
    const errorResponse = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message: typeof message === 'string' ? message : (message as any).message || 'An error occurred',
      correlationId: request.headers['x-correlation-id'],
    };

    response.status(status).json(errorResponse);
  }
}

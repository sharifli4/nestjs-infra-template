import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response, Request } from 'express';
import { CustomLoggerService } from './logger.service';

interface ErrorResponse {
  statusCode: number;
  message: string | string[];
  error: string;
}

@Catch()
export class LoggerExceptionFilter implements ExceptionFilter {
  constructor(private readonly logger: CustomLoggerService) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request & { correlationId?: string }>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let exceptionResponse: ErrorResponse;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const errorResponse = exception.getResponse();

      if (typeof errorResponse === 'object') {
        exceptionResponse = errorResponse as ErrorResponse;
      } else {
        exceptionResponse = {
          statusCode: status,
          message: String(errorResponse),
          error: 'Error',
        };
      }
    } else if (exception instanceof Error) {
      exceptionResponse = {
        statusCode: status,
        message: exception.message,
        error: 'Internal Server Error',
      };
    } else {
      exceptionResponse = {
        statusCode: status,
        message: 'An unexpected error occurred',
        error: 'Internal Server Error',
      };
    }

    // Log the exception
    this.logger.error(
      `Exception caught: ${String(exception)}`,
      exception instanceof Error ? exception.stack : undefined,
      {
        path: request.url,
        method: request.method,
        statusCode: status,
        correlationId: request.correlationId,
        exception: exceptionResponse,
      },
    );

    // Return standardized response
    response.status(status).json(exceptionResponse);
  }
}

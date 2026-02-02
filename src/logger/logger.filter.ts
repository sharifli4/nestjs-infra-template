import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { CustomLoggerService } from './logger.service';

@Catch()
export class LoggerExceptionFilter implements ExceptionFilter {
  constructor(private readonly logger: CustomLoggerService) {}

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let exceptionResponse: any;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      exceptionResponse = exception.getResponse();
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
      `Exception caught: ${exception}`,
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

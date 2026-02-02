import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { ConfigService } from '@nestjs/config';
import { CustomLoggerService } from './logger.service';
import { LoggerConfig } from '../config/logger.config';
import { randomUUID } from 'crypto';

@Injectable()
export class LoggerInterceptor implements NestInterceptor {
  private excludePaths: string[];

  constructor(
    private readonly logger: CustomLoggerService,
    private readonly configService: ConfigService,
  ) {
    const config = this.configService.get<LoggerConfig>('logger')!;
    this.excludePaths = config.excludePaths;
  }

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url, body } = request;

    // Skip logging for excluded paths
    if (this.excludePaths.some((path) => url.includes(path))) {
      return next.handle();
    }

    // Add correlation ID
    const correlationId = randomUUID();
    request.correlationId = correlationId;

    const now = Date.now();

    this.logger.log('Incoming request', {
      method,
      url,
      body,
      correlationId,
    });

    return next.handle().pipe(
      tap({
        next: (data) => {
          const response = context.switchToHttp().getResponse();
          const { statusCode } = response;
          const responseTime = Date.now() - now;

          this.logger.log('Request completed', {
            method,
            url,
            statusCode,
            responseTime: `${responseTime}ms`,
            correlationId,
          });
        },
        error: (error) => {
          const responseTime = Date.now() - now;

          this.logger.error('Request failed', error.stack, {
            method,
            url,
            error: error.message,
            responseTime: `${responseTime}ms`,
            correlationId,
          });
        },
      }),
    );
  }
}

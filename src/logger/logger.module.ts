import { Module, Global } from '@nestjs/common';
import { APP_INTERCEPTOR, APP_FILTER } from '@nestjs/core';
import { CustomLoggerService } from './logger.service';
import { LoggerInterceptor } from './logger.interceptor';
import { LoggerExceptionFilter } from './logger.filter';

@Global()
@Module({
  providers: [
    CustomLoggerService,
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggerInterceptor,
    },
    {
      provide: APP_FILTER,
      useClass: LoggerExceptionFilter,
    },
  ],
  exports: [CustomLoggerService],
})
export class LoggerModule {}

import { Injectable, LoggerService } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as winston from 'winston';
import { LoggerConfig } from '../config/logger.config';

@Injectable()
export class CustomLoggerService implements LoggerService {
  private logger: winston.Logger;
  private sensitiveFields: string[];

  constructor(private readonly configService: ConfigService) {
    const config = this.configService.get<LoggerConfig>('logger')!;
    this.sensitiveFields = config.sensitiveFields;

    const format =
      config.format === 'json'
        ? winston.format.combine(
            winston.format.timestamp(),
            winston.format.errors({ stack: true }),
            winston.format.json(),
          )
        : winston.format.combine(
            winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
            winston.format.errors({ stack: true }),
            winston.format.colorize(),
            winston.format.printf(({ level, message, timestamp, ...meta }) => {
              const metaString =
                Object.keys(meta).length > 0
                  ? `\n${JSON.stringify(meta, null, 2)}`
                  : '';
              return `${timestamp} [${level}]: ${message}${metaString}`;
            }),
          );

    this.logger = winston.createLogger({
      level: config.level,
      format,
      transports: [new winston.transports.Console()],
    });
  }

  private maskSensitiveData(data: any): any {
    if (typeof data !== 'object' || data === null) {
      return data;
    }

    if (Array.isArray(data)) {
      return data.map((item) => this.maskSensitiveData(item));
    }

    const masked = { ...data };
    for (const key of Object.keys(masked)) {
      if (
        this.sensitiveFields.some((field) =>
          key.toLowerCase().includes(field.toLowerCase()),
        )
      ) {
        masked[key] = '***MASKED***';
      } else if (typeof masked[key] === 'object') {
        masked[key] = this.maskSensitiveData(masked[key]);
      }
    }
    return masked;
  }

  log(message: string, context?: any) {
    this.logger.info(message, this.maskSensitiveData(context));
  }

  error(message: string, trace?: string, context?: any) {
    this.logger.error(message, {
      trace,
      ...this.maskSensitiveData(context),
    });
  }

  warn(message: string, context?: any) {
    this.logger.warn(message, this.maskSensitiveData(context));
  }

  debug(message: string, context?: any) {
    this.logger.debug(message, this.maskSensitiveData(context));
  }

  verbose(message: string, context?: any) {
    this.logger.verbose(message, this.maskSensitiveData(context));
  }
}

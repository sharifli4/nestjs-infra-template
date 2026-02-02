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
            winston.format.printf((info) => {
              const { level, message, timestamp, ...meta } = info;
              const metaString =
                Object.keys(meta).length > 0
                  ? `\n${JSON.stringify(meta, null, 2)}`
                  : '';
              return `${String(timestamp)} [${String(level)}]: ${String(message)}${metaString}`;
            }),
          );

    this.logger = winston.createLogger({
      level: config.level,
      format,
      transports: [new winston.transports.Console()],
    });
  }

  private maskSensitiveData(data: unknown): unknown {
    if (typeof data !== 'object' || data === null) {
      return data;
    }

    if (Array.isArray(data)) {
      return data.map((item) => this.maskSensitiveData(item));
    }

    const masked: Record<string, unknown> = {
      ...(data as Record<string, unknown>),
    };
    for (const key of Object.keys(masked)) {
      if (
        this.sensitiveFields.some((field) =>
          key.toLowerCase().includes(field.toLowerCase()),
        )
      ) {
        masked[key] = '***MASKED***';
      } else if (typeof masked[key] === 'object' && masked[key] !== null) {
        masked[key] = this.maskSensitiveData(masked[key]);
      }
    }
    return masked;
  }

  log(message: string, context?: unknown): void {
    this.logger.info(message, this.maskSensitiveData(context ?? {}));
  }

  error(message: string, trace?: string, context?: unknown): void {
    this.logger.error(message, {
      trace,
      ...(this.maskSensitiveData(context ?? {}) as object),
    });
  }

  warn(message: string, context?: unknown): void {
    this.logger.warn(message, this.maskSensitiveData(context ?? {}));
  }

  debug(message: string, context?: unknown): void {
    this.logger.debug(message, this.maskSensitiveData(context ?? {}));
  }

  verbose(message: string, context?: unknown): void {
    this.logger.verbose(message, this.maskSensitiveData(context ?? {}));
  }
}

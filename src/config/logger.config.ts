import { registerAs } from '@nestjs/config';

export interface LoggerConfig {
  level: string;
  format: 'json' | 'pretty';
  sensitiveFields: string[];
  errorLogExchange: string;
  excludePaths: string[];
}

export default registerAs(
  'logger',
  (): LoggerConfig => ({
    level: process.env.LOG_LEVEL || 'debug',
    format: (process.env.LOG_FORMAT as 'json' | 'pretty') || 'pretty',
    sensitiveFields: process.env.LOG_SENSITIVE_FIELDS
      ? process.env.LOG_SENSITIVE_FIELDS.split(',')
      : [
          'password',
          'refreshToken',
          'accessToken',
          'apiKey',
          'secret',
          'token',
        ],
    errorLogExchange: process.env.ERROR_LOG_EXCHANGE || 'error-logs',
    excludePaths: process.env.LOG_EXCLUDE_PATHS
      ? process.env.LOG_EXCLUDE_PATHS.split(',')
      : ['/api/v1/health', '/health'],
  }),
);

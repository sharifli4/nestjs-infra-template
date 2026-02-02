import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { env } from './config/env';

interface HealthCheckResponse {
  status: string;
  timestamp: string;
  uptime: number;
  environment: string;
  services: {
    database?: string;
    redis?: string;
    vault?: string;
  };
}

@ApiTags('health')
@Controller('health')
export class HealthController {
  @Get()
  @ApiOperation({ summary: 'Health check endpoint' })
  @ApiResponse({
    status: 200,
    description: 'Application is healthy',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', example: 'ok' },
        timestamp: { type: 'string', example: '2026-02-02T12:00:00.000Z' },
        uptime: { type: 'number', example: 123.45 },
        environment: { type: 'string', example: 'development' },
        services: {
          type: 'object',
          properties: {
            database: { type: 'string', example: 'enabled' },
            redis: { type: 'string', example: 'enabled' },
            vault: { type: 'string', example: 'disabled' },
          },
        },
      },
    },
  })
  check(): HealthCheckResponse {
    const services: HealthCheckResponse['services'] = {};

    if (env.USE_DATABASE) {
      services.database = 'enabled';
    }

    if (env.USE_REDIS) {
      services.redis = 'enabled';
    }

    if (env.USE_VAULT) {
      services.vault = 'enabled';
    }

    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: env.NODE_ENV,
      services,
    };
  }

  @Get('ready')
  @ApiOperation({ summary: 'Readiness probe endpoint for Kubernetes' })
  @ApiResponse({
    status: 200,
    description: 'Application is ready to accept traffic',
  })
  readiness(): { status: string } {
    // Application is ready if it can respond
    return { status: 'ready' };
  }

  @Get('live')
  @ApiOperation({ summary: 'Liveness probe endpoint for Kubernetes' })
  @ApiResponse({
    status: 200,
    description: 'Application is alive and running',
  })
  liveness(): { status: string } {
    // Application is alive if it can respond
    return { status: 'alive' };
  }
}

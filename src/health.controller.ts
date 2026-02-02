import { Controller, Get, HttpException, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { MikroORM } from '@mikro-orm/core';
import { RedisService } from './redis/redis.service';
import { env } from './config/env';

interface ServiceStatus {
  status: 'up' | 'down' | 'disabled';
  message?: string;
  responseTime?: number;
}

interface HealthCheckResponse {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  uptime: number;
  environment: string;
  version: string;
  services: {
    database?: ServiceStatus;
    redis?: ServiceStatus;
    vault?: ServiceStatus;
  };
}

@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(
    private readonly configService: ConfigService,
    private readonly orm?: MikroORM,
    private readonly redisService?: RedisService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Comprehensive health check with service status' })
  @ApiResponse({
    status: 200,
    description: 'Application health status',
    schema: {
      type: 'object',
      properties: {
        status: {
          type: 'string',
          enum: ['healthy', 'degraded', 'unhealthy'],
          example: 'healthy',
        },
        timestamp: { type: 'string', example: '2026-02-02T12:00:00.000Z' },
        uptime: { type: 'number', example: 123.45 },
        environment: { type: 'string', example: 'development' },
        version: { type: 'string', example: '1.0.0' },
        services: {
          type: 'object',
          properties: {
            database: {
              type: 'object',
              properties: {
                status: { type: 'string', example: 'up' },
                responseTime: { type: 'number', example: 5 },
              },
            },
            redis: {
              type: 'object',
              properties: {
                status: { type: 'string', example: 'up' },
                responseTime: { type: 'number', example: 2 },
              },
            },
            vault: {
              type: 'object',
              properties: {
                status: { type: 'string', example: 'disabled' },
              },
            },
          },
        },
      },
    },
  })
  async check(): Promise<HealthCheckResponse> {
    const services: HealthCheckResponse['services'] = {};
    const serviceStatuses: Array<'up' | 'down' | 'disabled'> = [];

    // Check database
    if (env.USE_DATABASE && this.orm) {
      const dbStatus = await this.checkDatabase();
      services.database = dbStatus;
      serviceStatuses.push(dbStatus.status);
    }

    // Check Redis
    if (env.USE_REDIS && this.redisService) {
      const redisStatus = await this.checkRedis();
      services.redis = redisStatus;
      serviceStatuses.push(redisStatus.status);
    }

    // Check Vault (if enabled)
    if (env.USE_VAULT) {
      services.vault = {
        status: 'disabled',
        message: 'Vault health check not implemented',
      };
    }

    // Determine overall status
    const hasDown = serviceStatuses.includes('down');
    const hasUp = serviceStatuses.includes('up');
    const overallStatus: 'healthy' | 'degraded' | 'unhealthy' = hasDown
      ? hasUp
        ? 'degraded'
        : 'unhealthy'
      : 'healthy';

    return {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: env.NODE_ENV,
      version: process.env.npm_package_version || '1.0.0',
      services,
    };
  }

  @Get('ready')
  @ApiOperation({
    summary: 'Readiness probe - checks if app can accept traffic',
  })
  @ApiResponse({
    status: 200,
    description: 'Application is ready',
  })
  @ApiResponse({
    status: 503,
    description: 'Application is not ready',
  })
  async readiness(): Promise<{ status: string }> {
    // Check critical services
    try {
      if (env.USE_DATABASE && this.orm) {
        await this.checkDatabase();
      }

      if (env.USE_REDIS && this.redisService) {
        await this.checkRedis();
      }

      return { status: 'ready' };
    } catch (error) {
      throw new HttpException(
        {
          status: 'not ready',
          error: error instanceof Error ? error.message : 'Unknown error',
        },
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
  }

  @Get('live')
  @ApiOperation({ summary: 'Liveness probe - checks if app is alive' })
  @ApiResponse({
    status: 200,
    description: 'Application is alive',
  })
  liveness(): { status: string; uptime: number } {
    // Simple liveness check - if this responds, app is alive
    return {
      status: 'alive',
      uptime: process.uptime(),
    };
  }

  @Get('startup')
  @ApiOperation({
    summary: 'Startup probe - checks if app has started successfully',
  })
  @ApiResponse({
    status: 200,
    description: 'Application has started',
  })
  startup(): { status: string; startupTime: number } {
    return {
      status: 'started',
      startupTime: process.uptime(),
    };
  }

  private async checkDatabase(): Promise<ServiceStatus> {
    if (!this.orm) {
      return { status: 'disabled' };
    }

    const start = Date.now();
    try {
      // Ping database
      await this.orm.em.getConnection().execute('SELECT 1');
      const responseTime = Date.now() - start;

      return {
        status: 'up',
        responseTime,
        message: 'Database connection successful',
      };
    } catch (error) {
      const responseTime = Date.now() - start;
      return {
        status: 'down',
        responseTime,
        message:
          error instanceof Error ? error.message : 'Database check failed',
      };
    }
  }

  private async checkRedis(): Promise<ServiceStatus> {
    if (!this.redisService) {
      return { status: 'disabled' };
    }

    const start = Date.now();
    try {
      // Ping Redis
      await this.redisService.getClient().ping();
      const responseTime = Date.now() - start;

      return {
        status: 'up',
        responseTime,
        message: 'Redis connection successful',
      };
    } catch (error) {
      const responseTime = Date.now() - start;
      return {
        status: 'down',
        responseTime,
        message: error instanceof Error ? error.message : 'Redis check failed',
      };
    }
  }
}

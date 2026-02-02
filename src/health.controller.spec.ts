import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { MikroORM } from '@mikro-orm/core';
import { HealthController } from './health.controller';
import { RedisService } from './redis/redis.service';

// Mock MikroORM
const mockOrm = {
  em: {
    getConnection: jest.fn().mockReturnValue({
      execute: jest.fn().mockResolvedValue([{}]),
    }),
  },
};

// Mock RedisService
const mockRedisService = {
  getClient: jest.fn().mockReturnValue({
    ping: jest.fn().mockResolvedValue('PONG'),
  }),
};

describe('HealthController', () => {
  let controller: HealthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              const config: Record<string, unknown> = {};
              return config[key];
            }),
          },
        },
        {
          provide: MikroORM,
          useValue: mockOrm,
        },
        {
          provide: RedisService,
          useValue: mockRedisService,
        },
      ],
    }).compile();

    controller = module.get<HealthController>(HealthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('check', () => {
    it('should return health status with healthy state', async () => {
      const result = await controller.check();

      expect(result).toHaveProperty('status');
      expect(['healthy', 'degraded', 'unhealthy']).toContain(result.status);
      expect(result).toHaveProperty('timestamp');
      expect(result).toHaveProperty('uptime');
      expect(result).toHaveProperty('environment');
      expect(result).toHaveProperty('version');
      expect(result).toHaveProperty('services');
      expect(typeof result.uptime).toBe('number');
    });

    it('should report healthy when no services are enabled', async () => {
      const result = await controller.check();
      expect(result.status).toBe('healthy');
    });
  });

  describe('readiness', () => {
    it('should return ready status when services are up', async () => {
      const result = await controller.readiness();
      expect(result).toHaveProperty('status', 'ready');
    });
  });

  describe('liveness', () => {
    it('should return alive status with uptime', () => {
      const result = controller.liveness();
      expect(result).toHaveProperty('status', 'alive');
      expect(result).toHaveProperty('uptime');
      expect(typeof result.uptime).toBe('number');
    });
  });

  describe('startup', () => {
    it('should return started status with startup time', () => {
      const result = controller.startup();
      expect(result).toHaveProperty('status', 'started');
      expect(result).toHaveProperty('startupTime');
      expect(typeof result.startupTime).toBe('number');
    });
  });
});

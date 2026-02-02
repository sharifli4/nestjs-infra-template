import { Test, TestingModule } from '@nestjs/testing';
import { HealthController } from './health.controller';

describe('HealthController', () => {
  let controller: HealthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
    }).compile();

    controller = module.get<HealthController>(HealthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('check', () => {
    it('should return health status', () => {
      const result = controller.check();

      expect(result).toHaveProperty('status', 'ok');
      expect(result).toHaveProperty('timestamp');
      expect(result).toHaveProperty('uptime');
      expect(result).toHaveProperty('environment');
      expect(result).toHaveProperty('services');
      expect(typeof result.uptime).toBe('number');
    });
  });

  describe('readiness', () => {
    it('should return ready status', () => {
      const result = controller.readiness();
      expect(result).toEqual({ status: 'ready' });
    });
  });

  describe('liveness', () => {
    it('should return alive status', () => {
      const result = controller.liveness();
      expect(result).toEqual({ status: 'alive' });
    });
  });
});

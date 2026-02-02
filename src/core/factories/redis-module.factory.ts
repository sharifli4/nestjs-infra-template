import { Type } from '@nestjs/common';
import { RedisModule } from '../../redis/redis.module';

/**
 * Factory for creating Redis module configuration
 * Implements Factory Pattern for optional module loading
 */
export class RedisModuleFactory {
  /**
   * Creates Redis module
   * @returns RedisModule class
   */
  static create(): Type<any> {
    return RedisModule;
  }

  /**
   * Checks if Redis module should be loaded
   * @returns true if USE_REDIS environment variable is set to 'true'
   */
  static shouldLoad(): boolean {
    return process.env.USE_REDIS === 'true';
  }
}

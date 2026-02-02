import { DynamicModule, Type } from '@nestjs/common';
import { DatabaseModuleFactory } from './database-module.factory';
import { RedisModuleFactory } from './redis-module.factory';
import { LoggerModule } from '../../logger/logger.module';

/**
 * Strategy interface for optional module loading
 */
interface ModuleLoadStrategy {
  shouldLoad(): boolean;
  create(): Type<any> | DynamicModule | Promise<DynamicModule>;
}

/**
 * Concrete strategy for Database module
 */
class DatabaseLoadStrategy implements ModuleLoadStrategy {
  shouldLoad(): boolean {
    return DatabaseModuleFactory.shouldLoad();
  }

  create(): DynamicModule | Promise<DynamicModule> {
    return DatabaseModuleFactory.create();
  }
}

/**
 * Concrete strategy for Redis module
 */
class RedisLoadStrategy implements ModuleLoadStrategy {
  shouldLoad(): boolean {
    return RedisModuleFactory.shouldLoad();
  }

  create(): Type<any> {
    return RedisModuleFactory.create();
  }
}

/**
 * Concrete strategy for Logger module (always loaded)
 */
class LoggerLoadStrategy implements ModuleLoadStrategy {
  shouldLoad(): boolean {
    return true; // Logger is always required
  }

  create(): Type<any> {
    return LoggerModule;
  }
}

/**
 * Builder for infrastructure modules
 * Implements Builder Pattern with Strategy Pattern for module loading
 *
 * @example
 * const modules = InfrastructureModuleBuilder.create()
 *   .withLogger()
 *   .withDatabase()
 *   .withRedis()
 *   .build();
 */
export class InfrastructureModuleBuilder {
  private strategies: ModuleLoadStrategy[] = [];

  /**
   * Creates a new builder instance
   */
  static create(): InfrastructureModuleBuilder {
    return new InfrastructureModuleBuilder();
  }

  /**
   * Adds logger module (always loaded)
   */
  withLogger(): this {
    this.strategies.push(new LoggerLoadStrategy());
    return this;
  }

  /**
   * Adds database module if enabled
   */
  withDatabase(): this {
    this.strategies.push(new DatabaseLoadStrategy());
    return this;
  }

  /**
   * Adds Redis module if enabled
   */
  withRedis(): this {
    this.strategies.push(new RedisLoadStrategy());
    return this;
  }

  /**
   * Builds and returns array of modules based on enabled strategies
   * @returns Array of modules to be imported
   */
  build(): Array<Type<any> | DynamicModule | Promise<DynamicModule>> {
    return this.strategies
      .filter((strategy) => strategy.shouldLoad())
      .map((strategy) => strategy.create());
  }

  /**
   * Returns information about which modules will be loaded
   * Useful for debugging and logging
   */
  getLoadedModules(): string[] {
    return this.strategies
      .filter((strategy) => strategy.shouldLoad())
      .map((strategy) => strategy.constructor.name.replace('LoadStrategy', ''));
  }
}

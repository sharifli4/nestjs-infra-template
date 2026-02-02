import { ConfigFactory } from '@nestjs/config';
import { env } from '../../config/env';
import databaseConfig from '../../config/database.config';
import redisConfig from '../../config/redis.config';
import loggerConfig from '../../config/logger.config';
import jwtConfig from '../../config/jwt.config';
import { vaultLoader } from '../../vault/vault.loader';

/**
 * Factory for creating configuration loaders
 * Implements Factory Pattern for configuration management
 */
export class ConfigurationLoaderFactory {
  /**
   * Creates array of configuration loaders based on enabled features
   * @returns Array of configuration loader functions
   */
  static createLoaders(): Array<ConfigFactory> {
    const loaders: Array<ConfigFactory> = [loggerConfig, jwtConfig];

    // Add database config if database is enabled
    if (env.USE_DATABASE) {
      loaders.push(databaseConfig);
    }

    // Add redis config if redis is enabled
    if (env.USE_REDIS) {
      loaders.push(redisConfig);
    }

    // Prepend vault loader if vault is enabled
    if (env.USE_VAULT) {
      return [vaultLoader as ConfigFactory, ...loaders];
    }

    return loaders;
  }

  /**
   * Returns information about loaded configurations
   * Useful for debugging and logging
   */
  static getLoadedConfigurations(): string[] {
    const configs: string[] = ['logger', 'jwt'];

    if (env.USE_DATABASE) {
      configs.push('database');
    }

    if (env.USE_REDIS) {
      configs.push('redis');
    }

    if (env.USE_VAULT) {
      configs.unshift('vault');
    }

    return configs;
  }

  /**
   * Determines the configuration file path
   * @returns .env file path or undefined if using Vault
   */
  static getEnvFilePath(): string | undefined {
    return env.USE_VAULT ? undefined : '.env';
  }
}

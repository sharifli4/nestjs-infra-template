import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { HealthModule } from './health.module';
import {
  InfrastructureModuleBuilder,
  ConfigurationLoaderFactory,
} from './core/factories';

/**
 * Root Application Module
 *
 * Uses Factory and Builder patterns to dynamically load infrastructure modules
 * based on environment configuration.
 *
 * Enabled modules are controlled via environment variables:
 * - USE_DATABASE=true - Loads MikroORM with PostgreSQL
 * - USE_REDIS=true - Loads Redis caching module
 * - USE_VAULT=true - Loads secrets from HashiCorp Vault
 *
 * Logger module is always loaded as it's core infrastructure.
 */
@Module({
  imports: [
    // Global configuration module with dynamic loaders
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ConfigurationLoaderFactory.getEnvFilePath(),
      load: ConfigurationLoaderFactory.createLoaders(),
    }),

    // Dynamically loaded infrastructure modules using Builder pattern
    ...InfrastructureModuleBuilder.create()
      .withLogger() // Always loaded
      .withDatabase() // Loaded if USE_DATABASE=true
      .withRedis() // Loaded if USE_REDIS=true
      .build(),

    // Health check module
    HealthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
